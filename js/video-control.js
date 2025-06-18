/* ========================================
   VIDEO-CONTROL.JS - Controle de Som do VSL (CORRIGIDO)
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
    console.log('Iniciando controles de vídeo...');
    initializeVideoControls();
});

function initializeVideoControls() {
    const video = document.getElementById('vslVideo');
    const soundBtn = document.getElementById('soundControlBtn');
    const overlay = document.getElementById('vslOverlay');
    const wrapper = document.querySelector('.vsl-wrapper');
    
    // Debug - verifica se elementos existem
    console.log('Elementos encontrados:', {
        video: !!video,
        soundBtn: !!soundBtn,
        overlay: !!overlay,
        wrapper: !!wrapper
    });
    
    if (!video) {
        console.error('Vídeo não encontrado!');
        return;
    }
    
    // Garante que o vídeo comece mutado
    video.muted = true;
    video.volume = 1; // Volume máximo quando desmutado
    
    // Event Listeners com preventDefault
    if (soundBtn) {
        soundBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão de som clicado');
            toggleSound(video);
        });
    }
    
    // Click no vídeo
    video.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Vídeo clicado');
        toggleSound(video);
    });
    
    // Click no overlay
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Overlay clicado');
            toggleSound(video);
        });
    }
    
    // Click no wrapper também
    if (wrapper) {
        wrapper.addEventListener('click', (e) => {
            // Só ativa se não for um clique em outro elemento
            if (e.target === wrapper || e.target.classList.contains('video-responsive-wrapper')) {
                e.preventDefault();
                console.log('Wrapper clicado');
                toggleSound(video);
            }
        });
    }
    
    // Verifica interação anterior
    checkPreviousInteraction();
    
    // Mostra overlay inicial (sem a classe hidden por padrão)
    if (VIDEO_CONFIG.autoShowOverlay && !videoState.hasInteracted && overlay) {
        console.log('Mostrando overlay inicial');
        overlay.classList.remove('hidden');
    }
    
    // Inicia animações
    startAttentionAnimations();
    
    // Monitora estado
    monitorVideoState(video);
}

// Toggle Som do Vídeo (SIMPLIFICADO)
function toggleSound(video) {
    console.log('Toggle sound chamado. Muted atual:', video.muted);
    
    const soundIcon = document.getElementById('soundIcon');
    const overlay = document.getElementById('vslOverlay');
    const soundWrapper = document.getElementById('soundControlWrapper');
    const soundStatus = document.getElementById('vslSoundStatus');
    
    if (video.muted) {
        // ATIVAR SOM
        console.log('Ativando som...');
        
        // Primeiro tenta dar play se o vídeo estiver pausado
        if (video.paused) {
            video.play().then(() => {
                console.log('Vídeo iniciado com sucesso');
            }).catch(err => {
                console.error('Erro ao iniciar vídeo:', err);
            });
        }
        
        // Desmuta o vídeo
        video.muted = false;
        videoState.isMuted = false;
        videoState.hasInteracted = true;
        
        // Atualiza interface
        if (soundIcon) soundIcon.className = 'fas fa-volume-up';
        
        if (soundStatus) {
            const statusIcon = soundStatus.querySelector('i');
            const statusText = soundStatus.querySelector('span');
            if (statusIcon) statusIcon.className = 'fas fa-volume-up';
            if (statusText) statusText.textContent = 'Som ativado - Aproveite os depoimentos!';
            soundStatus.classList.add('active');
        }
        
        // Esconde elementos
        if (overlay) overlay.classList.add('hidden');
        if (soundWrapper) soundWrapper.classList.add('playing');
        
        // Salva preferência
        setCookie(VIDEO_CONFIG.cookieName, 'true', VIDEO_CONFIG.cookieDays);
        
        // Para animações
        stopAttentionAnimations();
        
        // Feedback
        showSuccessFeedback();
        
        console.log('Som ativado com sucesso!');
        
    } else {
        // DESATIVAR SOM
        console.log('Desativando som...');
        
        video.muted = true;
        videoState.isMuted = true;
        
        // Atualiza interface
        if (soundIcon) soundIcon.className = 'fas fa-volume-mute';
        
        if (soundStatus) {
            const statusIcon = soundStatus.querySelector('i');
            const statusText = soundStatus.querySelector('span');
            if (statusIcon) statusIcon.className = 'fas fa-volume-mute';
            if (statusText) statusText.textContent = 'Vídeo sem som - Clique para ativar';
            soundStatus.classList.remove('active');
        }
        
        // Mostra controles novamente
        if (soundWrapper) soundWrapper.classList.remove('playing');
        
        console.log('Som desativado');
    }
}

// Animações de atenção
function startAttentionAnimations() {
    const soundWrapper = document.getElementById('soundControlWrapper');
    if (!soundWrapper) return;
    
    videoState.pulseTimer = setInterval(() => {
        if (videoState.isMuted) {
            soundWrapper.classList.add('super-pulse');
            
            setTimeout(() => {
                soundWrapper.classList.remove('super-pulse');
            }, 3000);
            
            // Notificação opcional
            if (window.showNotification && Math.random() > 0.7) {
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

// Para animações
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
    let watchTime = 0;
    
    video.addEventListener('play', () => {
        console.log('Vídeo play event');
    });
    
    video.addEventListener('pause', () => {
        console.log('Vídeo pause event');
    });
    
    // Timer de watch time
    setInterval(() => {
        if (!video.paused && !video.ended) {
            watchTime++;
            
            if (watchTime === 10) {
                console.log('10 segundos assistidos');
            } else if (watchTime === 30) {
                console.log('30 segundos assistidos');
            }
        }
    }, 1000);
}

// Feedback visual
function showSuccessFeedback() {
    const feedback = document.createElement('div');
    feedback.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Som ativado com sucesso!</span>
    `;
    
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #00D563;
        color: white;
        padding: 20px 40px;
        border-radius: 50px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 9999;
        box-shadow: 0 10px 30px rgba(0, 213, 99, 0.5);
        animation: feedbackPop 0.5s ease-out;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => feedback.remove(), 300);
    }, 2000);
}

// Verifica interação anterior
function checkPreviousInteraction() {
    const hasActivated = getCookie(VIDEO_CONFIG.cookieName);
    
    if (hasActivated === 'true') {
        videoState.hasInteracted = true;
        console.log('Usuário já ativou som anteriormente');
    }
}

// Cookies
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length);
        }
    }
    return null;
}

// CSS para animações
const styles = `
<style>
.sound-control-wrapper.super-pulse .sound-control-btn {
    animation: superPulse 0.5s ease-out 3 !important;
}

@keyframes superPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
}

@keyframes feedbackPop {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }
    100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}

/* Garante que overlay fique invisível quando hidden */
.vsl-overlay.hidden {
    opacity: 0 !important;
    pointer-events: none !important;
    display: none !important;
}

/* Garante que botão fique invisível quando playing */
.sound-control-wrapper.playing {
    opacity: 0 !important;
    pointer-events: none !important;
}
</style>
`;

// Adiciona estilos
document.head.insertAdjacentHTML('beforeend', styles);

// Log para debug
console.log('Video control script carregado completamente');