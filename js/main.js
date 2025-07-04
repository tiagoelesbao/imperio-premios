/* ========================================
   MAIN.JS - JavaScript Principal Atualizado
   ======================================== */

// Configurações Globais
const CONFIG = {
    whatsappLink: 'https://sndflw.com/i/BSgzoay66oMFH19XvaJ7',
    countdownTime: 347, // segundos
    spotsAvailable: 147,
    onlineUsers: 2384,
    animationDuration: 300,
    notificationInterval: 15000,
    particleCount: 50
};

// Estado Global
const state = {
    timeLeft: CONFIG.countdownTime,
    spots: CONFIG.spotsAvailable,
    onlineCount: CONFIG.onlineUsers,
    isLoading: true
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Função Principal de Inicialização
function initializeApp() {
    // Remove loading screen
    hideLoadingScreen();
    
    // Inicializa partículas
    createParticles();
    
    // Inicializa contadores
    initializeCountdown();
    initializeSpotsCounter();
    initializeOnlineCounter();
    
    // Inicializa FAQ
    initializeFAQ();
    
    // Inicializa números animados
    initializeAnimatedNumbers();
    
    // Inicializa observadores de scroll
    initializeScrollObservers();
    
    // Inicializa botões CTA
    initializeCTAButtons();
    
    // Previne clique com botão direito nas imagens
    preventImageRightClick();
    
    // Inicializa smooth scroll
    initializeSmoothScroll();
    
    // Fix para iOS
    fixIOSViewport();
}

// Remove Loading Screen
function hideLoadingScreen() {
    const loadingOverlay = document.getElementById('loading');
    if (loadingOverlay) {
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

// Cria Partículas Animadas
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < CONFIG.particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Countdown Timer
function initializeCountdown() {
    const updateCountdown = () => {
        const hours = Math.floor(state.timeLeft / 3600);
        const minutes = Math.floor((state.timeLeft % 3600) / 60);
        const seconds = state.timeLeft % 60;
        
        updateElement('hours', hours.toString().padStart(2, '0'));
        updateElement('minutes', minutes.toString().padStart(2, '0'));
        updateElement('seconds', seconds.toString().padStart(2, '0'));
        updateElement('timer', `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        
        if (state.timeLeft > 0) {
            state.timeLeft--;
        } else {
            state.timeLeft = CONFIG.countdownTime; // Reset
            showUrgencyNotification();
        }
    };
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Contador de Vagas
function initializeSpotsCounter() {
    const updateSpots = () => {
        if (state.spots > 10 && Math.random() > 0.8) {
            state.spots--;
            updateElement('spotsLeft', state.spots);
            updateElement('spots', state.spots);
            
            // Adiciona efeito visual quando spots diminui
            const spotsElement = document.getElementById('spotsLeft');
            if (spotsElement) {
                spotsElement.classList.add('pulse-animation');
                setTimeout(() => {
                    spotsElement.classList.remove('pulse-animation');
                }, 1000);
            }
        }
    };
    
    setInterval(updateSpots, 5000);
}

// Contador de Usuários Online
function initializeOnlineCounter() {
    const updateOnline = () => {
        // Variação aleatória de usuários online
        const variation = Math.floor(Math.random() * 100) - 50;
        state.onlineCount = Math.max(1500, state.onlineCount + variation);
        updateElement('onlineCount', state.onlineCount.toLocaleString('pt-BR'));
    };
    
    setInterval(updateOnline, 10000);
}

// FAQ Accordion
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Fecha todos os outros
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                    item.querySelector('.faq-answer').setAttribute('aria-hidden', 'true');
                }
            });
            
            // Toggle atual
            faqItem.classList.toggle('active');
            question.setAttribute('aria-expanded', !isActive);
            faqItem.querySelector('.faq-answer').setAttribute('aria-hidden', isActive);
        });
        
        // Suporte para teclado
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });
}

// Números Animados
function initializeAnimatedNumbers() {
    const animateValue = (element, start, end, duration) => {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
                
                // Adiciona efeito de celebration
                if (element.dataset.celebrate === 'true') {
                    celebrateNumber(element);
                }
            }
            
            // Formatação especial para moeda
            if (element.dataset.format === 'currency') {
                element.textContent = formatCurrency(Math.floor(current));
            } else {
                element.textContent = Math.floor(current).toLocaleString('pt-BR');
            }
        }, 16);
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.hasAttribute('data-count')) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateValue(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('[data-count]').forEach(el => {
        observer.observe(el);
    });
}

// Scroll Observers
function initializeScrollObservers() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Adiciona classes específicas para diferentes elementos
                if (entry.target.classList.contains('trust-badge')) {
                    entry.target.style.animationDelay = `${entry.target.dataset.delay || 0}s`;
                }
            }
        });
    }, observerOptions);
    
    // Observa elementos específicos
    const elementsToObserve = [
        '.trust-badge',
        '.step-card',
        '.faq-item',
        '.slide-up',
        '.offer-image',
        '.offer-text'
    ];
    
    elementsToObserve.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.dataset.delay = index * 0.1;
            observer.observe(el);
        });
    });
}

// CTA Buttons Tracking
function initializeCTAButtons() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Adiciona efeito de ripple
            createRippleEffect(e, button);
            
            // Tracking do clique
            trackEvent('CTA_Click', {
                button_text: button.textContent.trim(),
                button_location: button.id || 'unknown'
            });
            
            // Adiciona delay pequeno para ver o efeito
            setTimeout(() => {
                window.location.href = button.href;
            }, 300);
            
            e.preventDefault();
        });
    });
}

// Efeito Ripple nos Botões
function createRippleEffect(e, button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Previne Clique Direito em Imagens
function preventImageRightClick() {
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
}

// Smooth Scroll
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Fix para iOS Viewport
function fixIOSViewport() {
    // First we get the viewport height and multiply it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // We listen to the resize event
    window.addEventListener('resize', () => {
        // We execute the same script as before
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
}

// Funções Auxiliares
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function showUrgencyNotification() {
    // Mostra notificação especial quando o timer zera
    if (window.showNotification) {
        window.showNotification({
            title: '⏰ ÚLTIMA CHANCE!',
            message: 'O grupo está fechando em breve!',
            type: 'urgent'
        });
    }
}

function trackEvent(eventName, eventData) {
    // Implementação de tracking (Google Analytics, Facebook Pixel, etc)
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, eventData);
    }
    
    // Console log para debug
    console.log('Event tracked:', eventName, eventData);
}

// Adiciona classe para dispositivos touch
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}

// Detecta e adiciona classe para Safari
if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    document.body.classList.add('safari');
}

// Export para uso em outros módulos
window.mainApp = {
    CONFIG,
    state,
    trackEvent,
    createRippleEffect,
    updateElement
};