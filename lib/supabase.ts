
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// SecureStore has a 2048-byte limit per key. Supabase sessions exceed this,
// so we split large values into numbered chunks.
const CHUNK_SIZE = 1800;

async function getChunked(key: string): Promise<string | null> {
    const first = await SecureStore.getItemAsync(`${key}_0`);
    if (first === null) return null;
    let result = first;
    for (let i = 1; ; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
        if (chunk === null) break;
        result += chunk;
    }
    return result;
}

async function setChunked(key: string, value: string): Promise<void> {
    await removeChunked(key);
    for (let i = 0; i * CHUNK_SIZE < value.length; i++) {
        await SecureStore.setItemAsync(`${key}_${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
}

async function removeChunked(key: string): Promise<void> {
    for (let i = 0; ; i++) {
        const exists = await SecureStore.getItemAsync(`${key}_${i}`);
        if (exists === null) break;
        await SecureStore.deleteItemAsync(`${key}_${i}`);
    }
}

const SecureStoreAdapter = {
    getItem: getChunked,
    setItem: setChunked,
    removeItem: removeChunked,
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
