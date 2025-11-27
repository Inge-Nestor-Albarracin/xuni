import { supabase } from './supabase.js';

let authChecked = false;

export async function checkAuth() {
    if (authChecked) {
        return await supabase.auth.getUser();
    }
    
    authChecked = true;
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
        console.error('Error de autenticación:', error);
        authChecked = false;
        return { user: null, error };
    }
    
    return { user, error: null };
}

export async function redirectIfNotAuthenticated() {
    const { user, error } = await checkAuth();
    
    if (error || !user) {
        console.log('Usuario no autenticado, redirigiendo a login...');
        // Prevenir bucles de redirección
        if (!window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
            window.location.href = 'login.html';
        }
        return null;
    }
    
    return user;
}

export async function redirectIfAuthenticated() {
    const { user, error } = await checkAuth();
    
    if (user && !error) {
        console.log('Usuario ya autenticado, redirigiendo a index...');
        // Prevenir bucles de redirección
        if (window.location.href.includes('login.html') || window.location.href.includes('register.html')) {
            window.location.href = 'index.html';
        }
        return user;
    }
    
    return null;
}

export async function logout() {
    authChecked = false;
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        console.error('Error al cerrar sesión:', error);
        throw error;
    }
    
    window.location.href = 'login.html';
}