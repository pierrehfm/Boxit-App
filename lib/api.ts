
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

    // Get stats for a specific project using the view
    getProjectStats: async (projectId: string) => {
        const { data, error } = await supabase
            .from('project_stats')
            .select('*')
            .eq('project_id', projectId)
            .single();

        if (error) throw error;
        return data as ProjectStats;
    },

    getRecentBoxes: async (projectId?: string, limit = 5) => {
        let query = supabase
            .from('boxes')
            .select(`
        *,
        items:items(count)
      `)
            .order('updated_at', { ascending: false })
            .limit(limit);

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map(box => ({
            ...box,
            item_count: box.items?.[0]?.count ?? 0
        }));
    },

    getAllBoxes: async (projectId: string) => {
        const { data, error } = await supabase
            .from('boxes')
            .select('*')
            .eq('project_id', projectId);

        if (error) throw error;
        return data as Box[];
    },

    getProjectMembers: async (projectId: string) => {
        const { data, error } = await supabase
            .from('project_members')
            .select(`
        user_id,
        role,
        user:profiles(full_name, avatar_url, email)
      `)
            .eq('project_id', projectId);

        if (error) throw error;
        return data.map((m: any) => ({
            user_id: m.user_id,
            role: m.role,
            full_name: m.user?.full_name,
            avatar_url: m.user?.avatar_url,
            email: m.user?.email
        })) as ProjectMember[];
    },

    addProjectMember: async (projectId: string, email: string) => {
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !users) throw new Error("Utilisateur introuvable.");

        const { error: memberError } = await supabase
            .from('project_members')
            .insert({
                project_id: projectId,
                user_id: users.id,
                role: 'viewer'
            });

        if (memberError) {
            if (memberError.code === '23505') {
                throw new Error("Cet utilisateur est déjà membre du projet.");
            }
            throw memberError;
        }
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

    getBox: async (boxId: string) => {
        const { data, error } = await supabase
            .from('boxes')
            .select('*')
            .eq('id', boxId)
            .single();

        if (error) throw error;
        return data as Box;
    },

    createBox: async (box: Partial<Box>) => {
        if (!box.project_id || !box.name || !box.qr_code) throw new Error("Missing required fields for box");

        const { data, error } = await supabase
            .from('boxes')
            .insert(box)
            .select()
            .single();

        if (error) throw error;
        return data as Box;
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

    createProject: async (name: string, description?: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");

        const { data, error } = await supabase
            .from('projects')
            .insert({ name, description, owner_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
