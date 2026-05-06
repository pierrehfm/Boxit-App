
import { supabase } from './supabase';

export type Project = {
    id: string;
    name: string;
    description: string | null;
    owner_id: string;
    created_at: string;
};

export type Box = {
    id: string;
    project_id: string;
    qr_code: string;
    name: string;
    room: string | null;
    color: string | null;
    is_fragile: boolean;
    status: 'filling' | 'sealed' | 'unpacked';
    cover_photo_path: string | null;
    created_at: string;
    updated_at: string;
};

export type Item = {
    id: string;
    box_id: string;
    name: string;
    quantity: number;
    description: string | null;
    created_at: string;
};

export type ProjectStats = {
    project_id: string;
    project_name: string;
    total_boxes: number;
    total_items: number;
    boxes_filling: number;
    boxes_sealed: number;
    boxes_unpacked: number;
};

export type ProjectMember = {
    user_id: string;
    role: 'owner' | 'editor' | 'viewer';
    full_name: string;
    avatar_url: string | null;
    email: string;
};

export type ItemWithBox = Item & {
    box: Pick<Box, 'id' | 'name' | 'room' | 'project_id' | 'status'> | null;
};

export const STATUS_LABELS: Record<Box['status'], { label: string; color: string; bgColor: string }> = {
    filling: { label: 'En cours', color: '#3B82F6', bgColor: '#DBEAFE' },
    sealed:  { label: 'Scellé',   color: '#10B981', bgColor: '#D1FAE5' },
    unpacked:{ label: 'Déballé',  color: '#8B5CF6', bgColor: '#F3E8FF' },
};

export const api = {
    getUserProjects: async () => {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Project[];
    },

    getProject: async (projectId: string) => {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (error) throw error;
        return data as Project;
    },

    createProject: async (name: string, description?: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Aucun utilisateur connecté.");

        const { data, error } = await supabase
            .from('projects')
            .insert({ name, description: description || null, owner_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data as Project;
    },

    getProjectStats: async (projectId: string) => {
        const { data, error } = await supabase
            .from('project_stats')
            .select('*')
            .eq('project_id', projectId)
            .single();

        if (error) throw error;
        return data as ProjectStats;
    },

    getAllProjectStats: async () => {
        // Fetch project IDs first (respects RLS), then filter the view.
        const { data: projects, error: projError } = await supabase
            .from('projects')
            .select('id');
        if (projError) throw projError;
        if (!projects || projects.length === 0) return [] as ProjectStats[];

        const projectIds = projects.map((p: { id: string }) => p.id);
        const { data, error } = await supabase
            .from('project_stats')
            .select('*')
            .in('project_id', projectIds);
        if (error) throw error;
        return data as ProjectStats[];
    },

    getRecentBoxes: async (projectId?: string, limit = 5) => {
        let query = supabase
            .from('boxes')
            .select('*, items:items(count)')
            .order('updated_at', { ascending: false })
            .limit(limit);

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map((box: any) => ({
            ...box,
            item_count: box.items?.[0]?.count ?? 0,
        }));
    },

    getAllBoxes: async (projectId: string) => {
        const { data, error } = await supabase
            .from('boxes')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Box[];
    },

    getBox: async (boxId: string) => {
        const { data, error } = await supabase
            .from('boxes')
            .select('*')
            .eq('id', boxId)
            .single();

        if (error) throw error;
        return data as Box;
    },

    getBoxByQR: async (qrCode: string) => {
        const { data, error } = await supabase
            .from('boxes')
            .select('*')
            .eq('qr_code', qrCode)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as Box | null;
    },

    createBox: async (box: Partial<Box>) => {
        if (!box.project_id || !box.name || !box.qr_code) {
            throw new Error("Champs requis manquants pour la création du carton.");
        }

        const sanitized = {
            project_id: box.project_id,
            qr_code: box.qr_code,
            name: box.name,
            room: box.room ?? null,
            color: box.color ?? null,
            is_fragile: box.is_fragile ?? false,
            status: 'filling' as const,
        };

        const { data, error } = await supabase
            .from('boxes')
            .insert(sanitized)
            .select()
            .single();

        if (error) throw error;
        return data as Box;
    },

    updateBoxStatus: async (boxId: string, status: Box['status']) => {
        const { data, error } = await supabase
            .from('boxes')
            .update({ status })
            .eq('id', boxId)
            .select()
            .single();

        if (error) throw error;
        return data as Box;
    },

    searchBoxes: async (query: string) => {
        const escaped = query.replace(/[%_\\]/g, '\\$&');
        const { data, error } = await supabase
            .from('boxes')
            .select('*, items:items(count)')
            .ilike('name', `%${escaped}%`)
            .order('updated_at', { ascending: false })
            .limit(30);

        if (error) throw error;
        return data.map((box: any) => ({
            ...box,
            item_count: box.items?.[0]?.count ?? 0,
        })) as (Box & { item_count: number })[];
    },

    searchItems: async (query: string) => {
        const escaped = query.replace(/[%_\\]/g, '\\$&');
        const { data, error } = await supabase
            .from('items')
            .select('*, box:boxes(id, name, room, project_id, status)')
            .ilike('name', `%${escaped}%`)
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) throw error;
        return data as ItemWithBox[];
    },

    getBoxItems: async (boxId: string) => {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('box_id', boxId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as Item[];
    },

    createItem: async (
        boxId: string,
        name: string,
        quantity: number,
        description?: string | null,
    ) => {
        const { data: box, error: boxError } = await supabase
            .from('boxes')
            .select('status')
            .eq('id', boxId)
            .single();

        if (boxError) throw boxError;
        if (box.status !== 'filling') {
            throw new Error("Impossible d'ajouter un item à un carton qui n'est pas en cours de remplissage.");
        }

        const { data, error } = await supabase
            .from('items')
            .insert({ box_id: boxId, name, quantity, description: description || null })
            .select()
            .single();

        if (error) throw error;
        return data as Item;
    },

    updateItem: async (itemId: string, name: string, quantity: number, description?: string | null) => {
        const { data, error } = await supabase
            .from('items')
            .update({ name, quantity, description: description || null })
            .eq('id', itemId)
            .select()
            .single();
        if (error) throw error;
        return data as Item;
    },

    deleteItem: async (itemId: string) => {
        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', itemId);
        if (error) throw error;
    },

    getProjectMembers: async (projectId: string) => {
        const { data, error } = await supabase
            .from('project_members')
            .select('user_id, role, user:profiles(full_name, avatar_url, email)')
            .eq('project_id', projectId);

        if (error) throw error;
        return data.map((m: any) => ({
            user_id: m.user_id,
            role: m.role,
            full_name: m.user?.full_name,
            avatar_url: m.user?.avatar_url,
            email: m.user?.email,
        })) as ProjectMember[];
    },

    addProjectMember: async (projectId: string, email: string) => {
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !users) throw new Error("Impossible d'ajouter ce membre. Vérifiez l'adresse email.");

        const { error: memberError } = await supabase
            .from('project_members')
            .insert({ project_id: projectId, user_id: users.id, role: 'viewer' });

        if (memberError) {
            if (memberError.code === '23505') {
                throw new Error("Impossible d'ajouter ce membre. Vérifiez l'adresse email.");
            }
            throw memberError;
        }
    },
};
