import { supabase } from './supabase.js';
import { deleteTweet } from './tweet.js';

export function updateUserProfile(userId) {
    return new Promise(async (resolve) => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) {
            console.error('Error cargando perfil:', error);
            resolve(null);
            return;
        }
        
        console.log('Perfil cargado:', profile);
        
        const usernameElement = document.getElementById('current-username');
        const handleElement = document.getElementById('current-handle');
        
        if (usernameElement && profile) {
            usernameElement.textContent = profile.full_name || 'Usuario';
        }
        
        if (handleElement && profile) {
            handleElement.textContent = `@${profile.username}`;
        }
        
        resolve(profile);
    });
}

export function renderTweets(tweets, currentUserId) {
    const tweetsContainer = document.getElementById('tweetsContainer');
    
    if (!tweetsContainer) return;
    
    tweetsContainer.innerHTML = '';
    
    if (tweets.length === 0) {
        tweetsContainer.innerHTML = `
            <div class="empty-state">
                <p>No hay tweets todavía. ¡Sé el primero en publicar!</p>
            </div>
        `;
        return;
    }
    
    tweets.forEach(tweet => {
        const tweetElement = createTweetElement(tweet, currentUserId);
        tweetsContainer.appendChild(tweetElement);
    });
}

function createTweetElement(tweet, currentUserId) {
    const tweetElement = document.createElement('div');
    tweetElement.className = 'tweet';
    tweetElement.dataset.tweetId = tweet.id;
    
    const isOwnTweet = currentUserId && tweet.user_id === currentUserId;
    const date = new Date(tweet.created_at);
    const formattedDate = formatTweetDate(date);
    
    tweetElement.innerHTML = `
        <div class="tweet-avatar"></div>
        <div class="tweet-content">
            <div class="tweet-header">
                <strong>${tweet.profiles?.full_name || 'Usuario'}</strong>
                <span>@${tweet.profiles?.username || 'anónimo'}</span>
                <span class="tweet-date">· ${formattedDate}</span>
            </div>
            <div class="tweet-text">${tweet.content}</div>
            <div class="tweet-actions">
                <button class="tweet-action">
                    <svg viewBox="0 0 24 24">
                        <g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g>
                    </svg>
                    <span>12</span>
                </button>
                <button class="tweet-action">
                    <svg viewBox="0 0 24 24">
                        <g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g>
                    </svg>
                    <span>4</span>
                </button>
                <button class="tweet-action">
                    <svg viewBox="0 0 24 24">
                        <g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g>
                    </svg>
                    <span>28</span>
                </button>
                <button class="tweet-action">
                    <svg viewBox="0 0 24 24">
                        <g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g>
                    </svg>
                    <span>156</span>
                </button>
                ${isOwnTweet ? `
                    <button class="delete-btn" data-tweet-id="${tweet.id}">Eliminar</button>
                ` : ''}
            </div>
        </div>
    `;
    
    // Agregar evento para eliminar tweet
    if (isOwnTweet) {
        const deleteBtn = tweetElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('¿Estás seguro de que quieres eliminar este tweet?')) {
                try {
                    await deleteTweet(tweet.id, currentUserId);
                    tweetElement.remove();
                } catch (error) {
                    alert('Error al eliminar tweet: ' + error.message);
                }
            }
        });
    }
    
    return tweetElement;
}

function formatTweetDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) {
        return 'Ahora';
    } else if (diffMins < 60) {
        return `${diffMins}m`;
    } else if (diffHours < 24) {
        return `${diffHours}h`;
    } else if (diffDays < 7) {
        return `${diffDays}d`;
    } else {
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
}

export function setupCharacterCounter() {
    const tweetContent = document.getElementById('tweetContent');
    const charCount = document.getElementById('charCount');
    
    if (tweetContent && charCount) {
        tweetContent.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = `${length}/280`;
            
            if (length > 280) {
                charCount.style.color = '#f91880';
            } else {
                charCount.style.color = '#71767b';
            }
        });
    }
}