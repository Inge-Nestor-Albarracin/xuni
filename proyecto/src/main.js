import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

async function initializeAuth() {
    console.log('🔐 Inicializando sistema de autenticación...');
    
    // Mostrar estado de carga inicial
    showLoadingState();
    
    // Verificar si ya está autenticado
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
            console.log('✅ Usuario ya autenticado, redirigiendo a home...');
            window.location.href = 'home.html';
            return;
        }
        
        // No autenticado, mostrar forms de login/registro
        hideLoadingState();
        setupAuthForms();
        
    } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        hideLoadingState();
        setupAuthForms();
    }
}

function showLoadingState() {
    document.getElementById('loadingSection').classList.add('active');
    document.getElementById('loginSection').classList.remove('active');
    document.getElementById('registerSection').classList.remove('active');
}

function hideLoadingState() {
    document.getElementById('loadingSection').classList.remove('active');
    document.getElementById('loginSection').classList.add('active');
}

function setupAuthForms() {
    // Toggle entre login y registro
    document.getElementById('showRegister').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginSection').classList.remove('active');
        document.getElementById('registerSection').classList.add('active');
    });
    
    document.getElementById('showLogin').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('registerSection').classList.remove('active');
        document.getElementById('loginSection').classList.add('active');
    });
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleLogin();
    });
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleRegister();
    });
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    
    if (!email || !password) {
        showMessage('Por favor completa todos los campos', 'error');
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
        
        console.log('✅ Login exitoso, redirigiendo a home...');
        window.location.href = 'home.html';
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        showMessage('Error en el login: ' + error.message, 'error');
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = 'Iniciar Sesión';
    }
}

async function handleRegister() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const username = document.getElementById('registerUsername').value;
    const fullName = document.getElementById('registerFullName').value;
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    
    if (!email || !password || !username || !fullName) {
        showMessage('Por favor completa todos los campos', 'error');
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
        
        showMessage('¡Registro exitoso! Ya puedes iniciar sesión.', 'success');
        
        // Volver al formulario de login
        document.getElementById('registerSection').classList.remove('active');
        document.getElementById('loginSection').classList.add('active');
        
        // Limpiar formulario
        document.getElementById('registerForm').reset();
        
    } catch (error) {
        console.error('❌ Error en registro:', error);
        showMessage('Error en el registro: ' + error.message, 'error');
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = 'Registrarse';
    }
}

function showMessage(message, type) {
    // Eliminar mensajes anteriores
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `auth-message ${type}`;
    messageElement.textContent = message;
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#f91880' : '#1d9bf0'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        max-width: 300px;
    `;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}