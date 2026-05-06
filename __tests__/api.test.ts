import { api, STATUS_LABELS } from '../lib/api';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: { getUser: jest.fn() },
  },
}));

const mockFrom = supabase.from as jest.Mock;

/**
 * Builds a thenable, chainable Supabase mock.
 * Awaiting the chain directly resolves to `result`.
 * Calling `.single()` on the chain also resolves to `result`.
 */
function supaChain(result: { data?: unknown; error?: unknown }) {
  const resolved = { data: result.data ?? null, error: result.error ?? null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = {
    then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
      Promise.resolve(resolved).then(onFulfilled, onRejected),
    catch: (onRejected: (e: unknown) => unknown) =>
      Promise.resolve(resolved).catch(onRejected),
    single: jest.fn().mockResolvedValue(resolved),
  };
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'ilike', 'in', 'order', 'limit']) {
    c[m] = jest.fn().mockReturnValue(c);
  }
  return c;
}

beforeEach(() => jest.clearAllMocks());

// STATUS_LABELS
describe('STATUS_LABELS', () => {
  it('has entries for all three statuses', () => {
    expect(STATUS_LABELS).toHaveProperty('filling');
    expect(STATUS_LABELS).toHaveProperty('sealed');
    expect(STATUS_LABELS).toHaveProperty('unpacked');
  });

  it('each entry has label, color, and bgColor', () => {
    for (const entry of Object.values(STATUS_LABELS)) {
      expect(entry).toHaveProperty('label');
      expect(entry).toHaveProperty('color');
      expect(entry).toHaveProperty('bgColor');
    }
  });

  it('has the expected French labels', () => {
    expect(STATUS_LABELS.filling.label).toBe('En cours');
    expect(STATUS_LABELS.sealed.label).toBe('Scellé');
    expect(STATUS_LABELS.unpacked.label).toBe('Déballé');
  });
});

// api.createBox
describe('api.createBox', () => {
  it('throws when project_id is missing', async () => {
    await expect(api.createBox({ name: 'Box', qr_code: 'abc' })).rejects.toThrow(
      'Champs requis manquants',
    );
  });

  it('throws when name is missing', async () => {
    await expect(api.createBox({ project_id: '1', qr_code: 'abc' })).rejects.toThrow(
      'Champs requis manquants',
    );
  });

  it('throws when qr_code is missing', async () => {
    await expect(api.createBox({ project_id: '1', name: 'Box' })).rejects.toThrow(
      'Champs requis manquants',
    );
  });

  it('returns the created box on success', async () => {
    const mockBox = { id: 'b1', project_id: '1', name: 'Box', qr_code: 'abc' };
    mockFrom.mockReturnValue(supaChain({ data: mockBox }));
    const result = await api.createBox({ project_id: '1', name: 'Box', qr_code: 'abc' });
    expect(result).toEqual(mockBox);
  });

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(supaChain({ error: { message: 'DB error' } }));
    await expect(
      api.createBox({ project_id: '1', name: 'Box', qr_code: 'abc' }),
    ).rejects.toMatchObject({ message: 'DB error' });
  });
});

// api.getBoxByQR
describe('api.getBoxByQR', () => {
  it('returns null when box is not found (PGRST116)', async () => {
    mockFrom.mockReturnValue(
      supaChain({ data: null, error: { code: 'PGRST116', message: 'No rows found' } }),
    );
    const result = await api.getBoxByQR('unknown-qr');
    expect(result).toBeNull();
  });

  it('throws on unexpected Supabase errors', async () => {
    mockFrom.mockReturnValue(
      supaChain({ data: null, error: { code: 'PGRST000', message: 'Unexpected error' } }),
    );
    await expect(api.getBoxByQR('some-qr')).rejects.toMatchObject({ code: 'PGRST000' });
  });

  it('returns the box when found', async () => {
    const mockBox = { id: 'b1', qr_code: 'valid-qr', name: 'Box 1' };
    mockFrom.mockReturnValue(supaChain({ data: mockBox }));
    const result = await api.getBoxByQR('valid-qr');
    expect(result).toEqual(mockBox);
  });
});

// api.getAllProjectStats
describe('api.getAllProjectStats', () => {
  it('returns an empty array when the user has no projects', async () => {
    mockFrom.mockReturnValue(supaChain({ data: [] }));
    const result = await api.getAllProjectStats();
    expect(result).toEqual([]);
  });

  it('fetches stats for existing projects', async () => {
    const mockStats = [{ project_id: 'p1', total_boxes: 3 }];
    mockFrom
      .mockReturnValueOnce(supaChain({ data: [{ id: 'p1' }] }))
      .mockReturnValueOnce(supaChain({ data: mockStats }));
    const result = await api.getAllProjectStats();
    expect(result).toEqual(mockStats);
  });
});

// api.addProjectMember
describe('api.addProjectMember', () => {
  it('throws "Utilisateur introuvable" when email is not registered', async () => {
    mockFrom.mockReturnValue(supaChain({ data: null, error: { message: 'not found' } }));
    await expect(api.addProjectMember('proj-1', 'nobody@test.com')).rejects.toThrow(
      'Utilisateur introuvable.',
    );
  });

  it('throws "déjà membre" when user is already in the project (code 23505)', async () => {
    mockFrom
      .mockReturnValueOnce(supaChain({ data: { id: 'user-1' } }))
      .mockReturnValueOnce(supaChain({ error: { code: '23505', message: 'duplicate key' } }));

    await expect(api.addProjectMember('proj-1', 'existing@test.com')).rejects.toThrow(
      'Cet utilisateur est déjà membre du projet.',
    );
  });

  it('re-throws other Supabase errors during insert', async () => {
    mockFrom
      .mockReturnValueOnce(supaChain({ data: { id: 'user-1' } }))
      .mockReturnValueOnce(supaChain({ error: { code: 'PGRST000', message: 'Unknown' } }));

    await expect(api.addProjectMember('proj-1', 'user@test.com')).rejects.toMatchObject({
      code: 'PGRST000',
    });
  });
});
