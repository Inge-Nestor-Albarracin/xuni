import { supabase } from './supabase.js';
import { getCurrentUser, signOut } from './auth.js';
import { loadTweets, createTweet } from './tweet.js';
import { updateUserProfile, renderTweets, setupCharacterCounter } from './ui.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', async function() {
    await initializeApp();
});

async function initializeApp() {
    console.log('🔧 Inicializando app...');
    
    try {
        // Verificar autenticación SIN redirigir automáticamente
        const user = await getCurrentUser();
        
        if (!user) {
            console.log('❌ No autenticado - mostrando estado no autenticado');
            showNotAuthenticatedState();
            return;
        }

        console.log('✅ Usuario autenticado:', user.id);
        currentUser = user;
        
        // Configurar la aplicación para usuario autenticado
        await setupAuthenticatedApp(user);
        
    } catch (error) {
        console.error('❌ Error inicializando app:', error);
        showErrorState('Error al cargar la aplicación');
    }
}

async function setupAuthenticatedApp(user) {
    try {
        // Cargar perfil y tweets
        await updateUserProfile(user.id);
        await loadAndRenderTweets(user.id);
        
        // Configurar eventos
        setupEventListeners();
        setupCharacterCounter();
        
        console.log('🚀 App configurada correctamente');
    } catch (error) {
        console.error('❌ Error configurando app:', error);
        showErrorState('Error configurando la aplicación');
    }
}

function showNotAuthenticatedState() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="not-authenticated">
                <h2>No has iniciado sesión</h2>
                <p>Para usar Twitter Clone, debes iniciar sesión.</p>
                <div class="auth-buttons">
                    <button onclick="window.location.href='login.html'" class="auth-btn primary">
                        Iniciar Sesión
                    </button>
                    <button onclick="window.location.href='register.html'" class="auth-btn secondary">
                        Registrarse
                    </button>
                </div>
            </div>
        `;
    }
}

function showErrorState(message) {
    const tweetsContainer = document.getElementById('tweetsContainer');
    if (tweetsContainer) {
        tweetsContainer.innerHTML = `<div class="error-state"><p>${message}</p></div>`;
    }
}

async function loadAndRenderTweets(userId) {
    try {
        const tweets = await loadTweets();
        renderTweets(tweets, userId);
    } catch (error) {
        console.error('Error cargando tweets:', error);
        showMessage('Error cargando tweets', 'error');
    }
}

function setupEventListeners() {
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                this.disabled = true;
                this.textContent = 'Cerrando sesión...';
                await signOut();
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                this.disabled = false;
                this.textContent = 'Cerrar Sesión';
            }
        });
    }
    
    // Crear tweet
    const tweetForm = document.getElementById('tweetForm');
    if (tweetForm) {
        tweetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleCreateTweet();
        });
    }
    
    // Botón de twittear en sidebar
    const tweetBtn = document.querySelector('.tweet-btn');
    if (tweetBtn) {
        tweetBtn.addEventListener('click', () => {
            document.getElementById('tweetContent').focus();
        });
    }
}

async function handleCreateTweet() {
    if (!currentUser) {
        showMessage('Debes iniciar sesión para twittear', 'error');
        return;
    }
    
    const tweetContent = document.getElementById('tweetContent');
    const content = tweetContent.value.trim();
    const submitBtn = document.querySelector('.tweet-submit');
    
    if (!content) {
        showMessage('El tweet no puede estar vacío', 'error');
        return;
    }
    
    if (content.length > 280) {
        showMessage('El tweet no puede tener más de 280 caracteres', 'error');
        return;
    }
    
    // Deshabilitar botón durante el envío
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publicando...';
    
    try {
        await createTweet(content, currentUser.id);
        
        // Limpiar formulario y recargar tweets
        tweetContent.value = '';
        document.getElementById('charCount').textContent = '0/280';
        await loadAndRenderTweets(currentUser.id);
        
        showMessage('¡Tweet publicado!', 'success');
    } catch (error) {
        console.error('Error creando tweet:', error);
        showMessage('Error al publicar tweet: ' + error.message, 'error');
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = 'Twittear';
    }
}

function showMessage(message, type) {
    // Implementación simple de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#f91880' : '#1d9bf0'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}