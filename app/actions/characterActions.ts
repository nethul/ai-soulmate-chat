'use server';

import { supabase } from '../../lib/supabase';
import { Character } from '../../types';

export async function saveCharacter(character: Character, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('chat_characters')
            .insert({
                user_id: userId,
                name: character.name,
                age: character.age,
                description: character.description,
                personality: character.personality,
                appearance: character.appearance,
                avatar_url: character.avatarUrl,
            });

        if (error) {
            console.error('Supabase Save Error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error('Server Action Error:', err);
        return { success: false, error: err.message || 'Failed to save character' };
    }
}
export async function getUserCharacters(userId: string): Promise<Character[]> {
    try {
        const { data, error } = await supabase
            .from('chat_characters')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Fetch Error:', error);
            return [];
        }

        return data.map((char: any) => ({
            id: char.id,
            name: char.name,
            age: char.age,
            description: char.description,
            personality: char.personality,
            appearance: char.appearance,
            avatarUrl: char.avatar_url,
        }));
    } catch (err) {
        console.error('Fetch Characters Error:', err);
        return [];
    }
}
