import { supabase } from './supabase.js';
import { redirectIfAuthenticated } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya está autenticado
    redirectIfAuthenticated();
    
    const registerForm = document.getElementById('registerForm');
    const goToLoginBtn = document.getElementById('goToLogin');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleRegister();
        });
    }
    
    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    }
});

async function handleRegister() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    const fullName = document.getElementById('fullName').value;
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    
    if (!email || !password || !username || !fullName) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    // Deshabilitar botón durante registro
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando...';
    
    try {
        // 1. Registrar usuario en Auth de Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        
        if (authError) throw authError;
        
        // 2. Crear perfil en la tabla profiles
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert([
                { 
                    id: authData.user.id, 
                    username: username, 
                    full_name: fullName 
                }
            ]);
        
        if (profileError) throw profileError;
        
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error('Error en registro:', error);
        alert('Error en el registro: ' + error.message);
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = 'Registrarse';
    }
}