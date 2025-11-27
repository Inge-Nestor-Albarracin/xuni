import { supabase } from './supabase.js';
import { redirectIfAuthenticated } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya está autenticado
    redirectIfAuthenticated();
    
    const loginForm = document.getElementById('loginForm');
    const goToRegisterBtn = document.getElementById('goToRegister');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleLogin();
        });
    }
    
    if (goToRegisterBtn) {
        goToRegisterBtn.addEventListener('click', function() {
            window.location.href = 'register.html';
        });
    }
});

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    
    if (!email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    // Deshabilitar botón durante login
    submitBtn.disabled = true;
    submitBtn.textContent = 'Iniciando sesión...';
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        
        console.log('Login exitoso, redirigiendo...');
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Error en login:', error);
        alert('Error en el login: ' + error.message);
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = 'Iniciar Sesión';
    }
}