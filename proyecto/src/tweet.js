import { supabase } from './supabase.js';

export async function loadTweets() {
    console.log('Cargando tweets...');
    
    const { data: tweets, error } = await supabase
        .from('tweets')
        .select(`
            *,
            profiles (
                username,
                full_name
            )
        `)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error cargando tweets:', error);
        throw error;
    }
    
    console.log('Tweets cargados:', tweets);
    return tweets;
}

export async function createTweet(content, userId) {
    if (!content.trim()) {
        throw new Error('El tweet no puede estar vacío');
    }
    
    if (content.length > 280) {
        throw new Error('El tweet no puede tener más de 280 caracteres');
    }
    
    console.log('Creando tweet para usuario:', userId);
    
    const { data, error } = await supabase
        .from('tweets')
        .insert([
            { 
                user_id: userId, 
                content: content 
            }
        ]);
    
    if (error) {
        console.error('Error creando tweet:', error);
        throw error;
    }
    
    return data;
}

export async function deleteTweet(tweetId, userId) {
    // Verificar que el usuario es el propietario del tweet
    const { data: tweet, error: fetchError } = await supabase
        .from('tweets')
        .select('user_id')
        .eq('id', tweetId)
        .single();
    
    if (fetchError) {
        console.error('Error recuperando tweet:', fetchError);
        throw fetchError;
    }
    
    if (tweet.user_id !== userId) {
        throw new Error('No tienes permiso para eliminar este tweet');
    }
    
    const { error } = await supabase
        .from('tweets')
        .delete()
        .eq('id', tweetId);
    
    if (error) {
        console.error('Error eliminando tweet:', error);
        throw error;
    }
    
    return true;
}