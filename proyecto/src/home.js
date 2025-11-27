import { supabase } from './supabase.js';
import { loadTweets, createTweet } from './tweet.js';
import { updateUserProfile, renderTweets, setupCharacterCounter } from './ui.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', async function() {
    await initializeHome();
});

async function initializeHome() {
    console.log('🏠 Inicializando home...');
    
    // Verificar autenticación UNA sola vez
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (!user) {
            console.log('❌ No autenticado, redirigiendo a index...');
            window.location.href = 'index.html';
            return;
        }

        console.log('✅ Usuario autenticado:', user.id);
        currentUser = user;
        
        // Configurar la aplicación
        await setupHomeApp(user);
        
    } catch (error) {
        console.error('❌ Error en home:', error);
        window.location.href = 'index.html';
    }
}

async function setupHomeApp(user) {
    try {
        // Cargar perfil y tweets
        await updateUserProfile(user.id);
        await loadAndRenderTweets(user.id);
        
        // Configurar eventos
        setupEventListeners();
        setupCharacterCounter();
        
        console.log('🚀 Home configurado correctamente');
    } catch (error) {
        console.error('❌ Error configurando home:', error);
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
    // Logout - SIMPLE Y DIRECTO
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                this.disabled = true;
                this.textContent = 'Cerrando sesión...';
                await supabase.auth.signOut();
                window.location.href = 'index.html';
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
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publicando...';
    
    try {
        await createTweet(content, currentUser.id);
        
        tweetContent.value = '';
        document.getElementById('charCount').textContent = '0/280';
        await loadAndRenderTweets(currentUser.id);
        
        showMessage('¡Tweet publicado!', 'success');
    } catch (error) {
        console.error('Error creando tweet:', error);
        showMessage('Error al publicar tweet: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Twittear';
    }
}

function showMessage(message, type) {
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