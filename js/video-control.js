/* ========================================
   VIDEO-CONTROL.JS - Controle de Som do VSL
   ======================================== */

// Configurações do Vídeo
const VIDEO_CONFIG = {
    autoShowOverlay: true,
    overlayDuration: 5000,
    pulseInterval: 10000,
    cookieName: 'vsl_sound_activated',
    cookieDays: 7
};

// Estado do Vídeo
const videoState = {
    isMuted: true,
    hasInteracted: false,
    overlayTimer: null,
    pulseTimer: null
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initializeVideoControls();
});

function initializeVideoControls() {
    const video = document.getElementById('vslVideo');
    const soundBtn = document.getElementById('soundControlBtn');
    const soundIcon = document.getElementById('soundIcon');
    const overlay = document.getElementById('vslOverlay');
    const soundWrapper = document.getElementById('soundControlWrapper');
    const soundStatus = document.getElementById('vslSoundStatus');
    
    if (!video || !soundBtn) {
        console.error('Elementos de vídeo não encontrados');
        return;
    }
    
    // Verifica se usuário já ativou som anteriormente
    checkPreviousInteraction();
    
    // Event Listeners
    soundBtn.addEventListener('click', () => toggleSound(video));
    video.addEventListener('click', () => toggleSound(video));
    overlay.addEventListener('click', () => toggleSound(video));
    
    // Mostra overlay inicial
    if (VIDEO_CONFIG.autoShowOverlay && !videoState.hasInteracted) {
        showInitialOverlay();
    }
    
    // Inicia animações de atenção
    startAttentionAnimations();
    
    // Monitora o estado do vídeo
    monitorVideoState(video);
}

// Toggle Som do Vídeo
function toggleSound(video) {
    const soundIcon = document.getElementById('soundIcon');
    const overlay = document.getElementById('vslOverlay');
    const soundWrapper = document.getElementById('soundControlWrapper');
    const soundStatus = document.getElementById('vslSoundStatus');
    const statusIcon = soundStatus.querySelector('i');
    const statusText = soundStatus.querySelector('span');
    
    if (videoState.isMuted) {
        // Ativa o som
        video.muted = false;
        videoState.isMuted = false;
        videoState.hasInteracted = true;
        
        // Atualiza ícones
        soundIcon.className = 'fas fa-volume-up';
        statusIcon.className = 'fas fa-volume-up';
        
        // Atualiza textos
        statusText.textContent = 'Som ativado - Aproveite os depoimentos!';
        soundStatus.classList.add('active');
        
        // Esconde controles
        overlay.classList.add('hidden');
        soundWrapper.classList.add('playing');
        
        // Salva preferência
        setCookie(VIDEO_CONFIG.cookieName, 'true', VIDEO_CONFIG.cookieDays);
        
        // Para animações de atenção
        stopAttentionAnimations();
        
        // Tracking
        trackVideoEvent('sound_activated');
        
        // Feedback visual
        showSuccessFeedback();
        
    } else {
        // Desativa o som
        video.muted = true;
        videoState.isMuted = true;
        
        // Atualiza ícones
        soundIcon.className = 'fas fa-volume-mute';
        statusIcon.className = 'fas fa-volume-mute';
        
        // Atualiza textos
        statusText.textContent = 'Vídeo sem som - Clique para ativar';
        soundStatus.classList.remove('active');
        
        // Mostra controles
        soundWrapper.classList.remove('playing');
        
        // Tracking
        trackVideoEvent('sound_deactivated');
    }
}

// Mostra overlay inicial
function showInitialOverlay() {
    const overlay = document.getElementById('vslOverlay');
    
    // Remove classe hidden após pequeno delay para animação
    setTimeout(() => {
        overlay.classList.remove('hidden');
    }, 1000);
    
    // Auto-hide após duração configurada
    videoState.overlayTimer = setTimeout(() => {
        if (videoState.isMuted) {
            overlay.classList.add('hidden');
        }
    }, VIDEO_CONFIG.overlayDuration);
}

// Animações de atenção periódicas
function startAttentionAnimations() {
    const soundWrapper = document.getElementById('soundControlWrapper');
    
    // Adiciona classe de super destaque periodicamente
    videoState.pulseTimer = setInterval(() => {
        if (videoState.isMuted && !soundWrapper.classList.contains('super-pulse')) {
            soundWrapper.classList.add('super-pulse');
            
            setTimeout(() => {
                soundWrapper.classList.remove('super-pulse');
            }, 3000);
            
            // Mostra notificação
            if (window.showNotification) {
                window.showNotification({
                    title: '🔊 Não perca!',
                    message: 'Ative o som para ouvir depoimentos incríveis',
                    type: 'warning',
                    duration: 4000
                });
            }
        }
    }, VIDEO_CONFIG.pulseInterval);
}

// Para animações de atenção
function stopAttentionAnimations() {
    if (videoState.overlayTimer) {
        clearTimeout(videoState.overlayTimer);
    }
    
    if (videoState.pulseTimer) {
        clearInterval(videoState.pulseTimer);
    }
}

// Monitora estado do vídeo
function monitorVideoState(video) {
    // Verifica se vídeo está tocando
    video.addEventListener('play', () => {
        console.log('Vídeo iniciado');
        trackVideoEvent('video_play');
    });
    
    video.addEventListener('pause', () => {
        console.log('Vídeo pausado');
        trackVideoEvent('video_pause');
    });
    
    // Monitora tempo assistido
    let watchTime = 0;
    let watchInterval = setInterval(() => {
        if (!video.paused && !video.ended) {
            watchTime++;
            
            // Marcos importantes
            if (watchTime === 10) {
                trackVideoEvent('watched_10s');
            } else if (watchTime === 30) {
                trackVideoEvent('watched_30s');
            } else if (watchTime === 60) {
                trackVideoEvent('watched_60s');
            }
        }
    }, 1000);
}

// Feedback visual de sucesso
function showSuccessFeedback() {
    // Cria elemento de feedback
    const feedback = document.createElement('div');
    feedback.className = 'sound-success-feedback';
    feedback.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Som ativado com sucesso!</span>
    `;
    
    // Estilo inline temporário
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--green);
        color: white;
        padding: 20px 40px;
        border-radius: 50px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 9999;
        animation: feedbackPop 0.5s ease-out;
    `;
    
    document.body.appendChild(feedback);
    
    // Remove após animação
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

// Verifica interação anterior
function checkPreviousInteraction() {
    const hasActivated = getCookie(VIDEO_CONFIG.cookieName);
    
    if (hasActivated === 'true') {
        videoState.hasInteracted = true;
        // Opcionalmente, pode ativar som automaticamente
        // setTimeout(() => toggleSound(document.getElementById('vslVideo')), 1000);
    }
}

// Tracking de eventos
function trackVideoEvent(eventName, data = {}) {
    if (window.mainApp && window.mainApp.trackEvent) {
        window.mainApp.trackEvent('video_' + eventName, {
            video_id: 'vsl_main',
            ...data
        });
    }
    
    console.log('Video Event:', eventName, data);
}

// Funções de Cookie
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    
    return null;
}

// CSS adicional para animação super-pulse
const additionalStyles = `
.sound-control-wrapper.super-pulse .sound-control-btn {
    animation: 
        superPulse 0.5s ease-out 3,
        shadowSuperPulse 0.5s ease-out 3 !important;
}

@keyframes superPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
}

@keyframes shadowSuperPulse {
    0% {
        box-shadow: 
            0 10px 30px rgba(255, 59, 59, 0.5),
            0 0 0 0 rgba(255, 59, 59, 0.8);
    }
    100% {
        box-shadow: 
            0 10px 30px rgba(255, 59, 59, 0.5),
            0 0 0 40px rgba(255, 59, 59, 0);
    }
}

@keyframes feedbackPop {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }
    50% {
        transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}
`;

// Injeta estilos adicionais
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Export para uso global
window.videoControl = {
    toggleSound,
    checkPreviousInteraction,
    trackVideoEvent
};