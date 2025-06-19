/* ========================================
   VIDEO-CONTROL.JS - Controle de Som do VSL (MOBILE FEEDBACK FIXED)
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

// Toggle Som do Vídeo (COM RESTART)
function toggleSound(video) {
    console.log('Toggle sound chamado. Muted atual:', video.muted);
    
    const soundIcon = document.getElementById('soundIcon');
    const overlay = document.getElementById('vslOverlay');
    const soundWrapper = document.getElementById('soundControlWrapper');
    const soundStatus = document.getElementById('vslSoundStatus');
    const soundAlertText = document.querySelector('.sound-alert-text strong');
    const soundAlertSpan = document.querySelector('.sound-alert-text span');
    
    // Atualiza textos do overlay
    if (soundAlertText) {
        soundAlertText.textContent = '🔊 Ative o som para ouvir a apresentação!';
    }
    if (soundAlertSpan) {
        soundAlertSpan.textContent = 'Clique no vídeo ou no botão';
    }
    
    if (video.muted) {
        // ATIVAR SOM
        console.log('Ativando som...');
        
        // Reinicia o vídeo do início
        video.currentTime = 0;
        
        // Primeiro tenta dar play se o vídeo estiver pausado
        video.play().then(() => {
            console.log('Vídeo iniciado com sucesso');
            
            // Desmuta o vídeo após iniciar
            video.muted = false;
            videoState.isMuted = false;
            videoState.hasInteracted = true;
            
        }).catch(err => {
            console.error('Erro ao iniciar vídeo:', err);
            // Tenta novamente com click simulado
            video.muted = false;
            video.play();
        });
        
        // Atualiza interface
        if (soundIcon) soundIcon.className = 'fas fa-volume-up';
        
        if (soundStatus) {
            const statusIcon = soundStatus.querySelector('i');
            const statusText = soundStatus.querySelector('span');
            if (statusIcon) statusIcon.className = 'fas fa-volume-up';
            if (statusText) statusText.textContent = 'Som ativado!';
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
        
        console.log('Som ativado!');
        
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
            if (statusText) statusText.textContent = 'Som desativado';
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
                    message: 'Ative o som para entender como funciona',
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
                if (window.trackEvent) {
                    window.trackEvent('Video_Engagement', {
                        action: 'watched_10_seconds',
                        muted: video.muted
                    });
                }
            } else if (watchTime === 30) {
                console.log('30 segundos assistidos');
                if (window.trackEvent) {
                    window.trackEvent('Video_Engagement', {
                        action: 'watched_30_seconds',
                        muted: video.muted
                    });
                }
            }
        }
    }, 1000);
}

// Feedback visual OTIMIZADO PARA MOBILE
function showSuccessFeedback() {
    const feedback = document.createElement('div');
    feedback.className = 'sound-feedback-popup';
    feedback.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Som ativado!</span>
    `;
    
    // Detecta se é mobile
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #00D563;
            color: white;
            padding: 12px 24px;
            border-radius: 40px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            box-shadow: 0 8px 20px rgba(0, 213, 99, 0.5);
            animation: feedbackPop 0.5s ease-out;
            white-space: nowrap;
            font-size: 14px;
            min-width: 150px;
            justify-content: center;
        `;
    } else {
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
    }
    
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

// CSS para animações e correções mobile
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

/* Correção específica para o feedback no mobile */
.sound-feedback-popup {
    white-space: nowrap !important;
}

.sound-feedback-popup i {
    font-size: 20px !important;
    flex-shrink: 0;
}

.sound-feedback-popup span {
    display: inline-block !important;
    white-space: nowrap !important;
    line-height: 1 !important;
}

/* Mobile: Animações mais lentas e correções */
@media (max-width: 768px) {
    .sound-control-wrapper.super-pulse .sound-control-btn {
        animation-duration: 0.8s !important;
    }
    
    /* Feedback mobile específico */
    .sound-feedback-popup {
        padding: 10px 20px !important;
        font-size: 13px !important;
        min-width: 140px !important;
    }
    
    .sound-feedback-popup i {
        font-size: 16px !important;
    }
    
    /* Correção para quebra de linha no mobile */
    .vsl-sound-status {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        max-width: 100% !important;
        padding: 0 10px !important;
    }
    
    .vsl-sound-status span {
        display: inline !important;
        white-space: nowrap !important;
    }
    
    .vsl-info p {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        font-size: 12px !important;
    }
}

/* Ajuste específico para telas muito pequenas */
@media (max-width: 480px) {
    .sound-feedback-popup {
        padding: 8px 16px !important;
        font-size: 12px !important;
        min-width: 120px !important;
        gap: 8px !important;
    }
    
    .sound-feedback-popup i {
        font-size: 14px !important;
    }
    
    .vsl-sound-status {
        font-size: 11px !important;
    }
    
    .vsl-sound-status span {
        display: none !important;
    }
    
    /* Mostra apenas o ícone e status básico */
    .vsl-sound-status.active::after {
        content: "Ativado" !important;
        margin-left: 5px;
        color: #00D563;
    }
    
    .vsl-sound-status:not(.active)::after {
        content: "Clique para ativar" !important;
        margin-left: 5px;
    }
}

/* Correção específica para o vídeo no modo vertical */
@media (max-width: 768px) and (max-aspect-ratio: 9/16) {
    .sound-feedback-popup {
        top: 40% !important;
    }
}
</style>
`;

// Adiciona estilos
document.head.insertAdjacentHTML('beforeend', styles);

// Log para debug
console.log('Video control script carregado completamente');