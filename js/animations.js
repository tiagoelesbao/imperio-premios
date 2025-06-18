/* ========================================
   ANIMATIONS.JS - Animações e Efeitos Visuais
   ======================================== */

// Configurações de Animação
const ANIMATION_CONFIG = {
    parallaxSpeed: 0.5,
    scrollThreshold: 100,
    animationClasses: ['fade-in', 'slide-up', 'slide-left', 'slide-right', 'zoom-in'],
    mouseFollowSpeed: 0.1
};

// Estado das Animações
const animationState = {
    lastScrollY: 0,
    ticking: false,
    mouseX: 0,
    mouseY: 0
};

// Inicialização das Animações
document.addEventListener('DOMContentLoaded', () => {
    initializeAnimations();
});

function initializeAnimations() {
    // Parallax no scroll
    initializeParallax();
    
    // Animações ao entrar na viewport
    initializeScrollAnimations();
    
    // Mouse follow effects
    initializeMouseEffects();
    
    // Animação de texto digitando
    initializeTypewriter();
    
    // Animações de hover avançadas
    initializeHoverEffects();
    
    // Animação de números crescentes
    initializeCountUpAnimations();
    
    // Efeitos de partículas no mouse
    initializeMouseParticles();
    
    // Animação do botão flutuante
    initializeFloatingButton();
}

// Parallax Effect
function initializeParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;
    
    const handleParallax = () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.parallax || ANIMATION_CONFIG.parallaxSpeed;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    };
    
    // Otimização com requestAnimationFrame
    const requestTick = () => {
        if (!animationState.ticking) {
            requestAnimationFrame(() => {
                handleParallax();
                animationState.ticking = false;
            });
            animationState.ticking = true;
        }
    };
    
    window.addEventListener('scroll', requestTick);
}

// Scroll Animations
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.dataset.animation || 'fade-in';
                const delay = element.dataset.animationDelay || 0;
                
                setTimeout(() => {
                    element.classList.add(animationType, 'animated');
                    
                    // Trigger específico para diferentes elementos
                    if (element.classList.contains('hero-title')) {
                        animateHeroTitle(element);
                    }
                }, delay * 1000);
                
                animationObserver.unobserve(element);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    animatedElements.forEach(element => {
        animationObserver.observe(element);
    });
}

// Mouse Effects
function initializeMouseEffects() {
    const glowElements = document.querySelectorAll('.mouse-glow');
    
    if (glowElements.length === 0) return;
    
    document.addEventListener('mousemove', (e) => {
        animationState.mouseX = e.clientX;
        animationState.mouseY = e.clientY;
        
        glowElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            element.style.setProperty('--mouse-x', `${x}px`);
            element.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// Typewriter Effect
function initializeTypewriter() {
    const typewriterElements = document.querySelectorAll('.typewriter');
    
    typewriterElements.forEach(element => {
        const text = element.textContent;
        const speed = parseInt(element.dataset.typeSpeed) || 100;
        element.textContent = '';
        element.style.visibility = 'visible';
        
        let index = 0;
        const typeWriter = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, speed);
            }
        };
        
        // Inicia quando elemento entra na viewport
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                typeWriter();
                observer.disconnect();
            }
        });
        
        observer.observe(element);
    });
}

// Hover Effects Avançados
function initializeHoverEffects() {
    // 3D Card Effect
    const cards3D = document.querySelectorAll('.card-3d');
    
    cards3D.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
    
    // Magnetic Buttons
    const magneticButtons = document.querySelectorAll('.magnetic-button');
    
    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });
}

// Count Up Animations
function initializeCountUpAnimations() {
    const countUpElements = document.querySelectorAll('.count-up');
    
    const countUp = (element, start, end, duration) => {
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
            if (entry.isIntersecting) {
                const element = entry.target;
                const start = parseInt(element.dataset.start) || 0;
                const end = parseInt(element.dataset.end) || 100;
                const duration = parseInt(element.dataset.duration) || 2000;
                
                countUp(element, start, end, duration);
                observer.unobserve(element);
            }
        });
    });
    
    countUpElements.forEach(element => {
        observer.observe(element);
    });
}

// Mouse Particles Effect
function initializeMouseParticles() {
    let particleContainer = document.getElementById('mouse-particles');
    
    if (!particleContainer) {
        particleContainer = document.createElement('div');
        particleContainer.id = 'mouse-particles';
        particleContainer.style.position = 'fixed';
        particleContainer.style.pointerEvents = 'none';
        particleContainer.style.zIndex = '9999';
        document.body.appendChild(particleContainer);
    }
    
    let lastTime = 0;
    const particleInterval = 50; // ms entre partículas
    
    document.addEventListener('mousemove', (e) => {
        const currentTime = Date.now();
        
        if (currentTime - lastTime > particleInterval) {
            createMouseParticle(e.clientX, e.clientY, particleContainer);
            lastTime = currentTime;
        }
    });
}

function createMouseParticle(x, y, container) {
    const particle = document.createElement('div');
    particle.className = 'mouse-particle';
    particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 6px;
        height: 6px;
        background: var(--gold);
        border-radius: 50%;
        pointer-events: none;
        opacity: 0.8;
        transform: translate(-50%, -50%);
        animation: particleFade 1s ease-out forwards;
    `;
    
    container.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 1000);
}

// Floating Button Animation
function initializeFloatingButton() {
    const floatingButton = document.querySelector('.whatsapp-float');
    
    if (!floatingButton) return;
    
    // Pulse animation on scroll stop
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        floatingButton.style.animation = 'none';
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            floatingButton.style.animation = 'float 3s ease-in-out infinite, pulse 2s ease-in-out infinite';
        }, 150);
    });
    
    // Shake animation periodically
    setInterval(() => {
        floatingButton.classList.add('shake');
        setTimeout(() => {
            floatingButton.classList.remove('shake');
        }, 500);
    }, 10000);
}

// Hero Title Animation
function animateHeroTitle(element) {
    const words = element.textContent.split(' ');
    element.textContent = '';
    
    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(20px)';
        span.style.animation = `wordFadeIn 0.6s ease-out ${index * 0.1}s forwards`;
        element.appendChild(span);
    });
}

// Celebrate Number Effect
function celebrateNumber(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Cria partículas de celebração
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'celebration-particle';
        particle.style.cssText = `
            position: fixed;
            left: ${centerX}px;
            top: ${centerY}px;
            width: 8px;
            height: 8px;
            background: ${Math.random() > 0.5 ? 'var(--gold)' : 'var(--green)'};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
        `;
        
        document.body.appendChild(particle);
        
        // Animação da partícula
        const angle = (Math.PI * 2 * i) / 20;
        const velocity = 5 + Math.random() * 5;
        const lifetime = 1000 + Math.random() * 1000;
        
        let opacity = 1;
        let x = 0;
        let y = 0;
        
        const updateParticle = () => {
            x += Math.cos(angle) * velocity;
            y += Math.sin(angle) * velocity + 2; // Gravidade
            opacity -= 1 / (lifetime / 16);
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(updateParticle);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(updateParticle);
    }
}

// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// CSS Animations (adicionar ao arquivo CSS)
const animationStyles = `
@keyframes particleFade {
    from {
        opacity: 0.8;
        transform: translate(-50%, -50%) scale(1);
    }
    to {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }
}

@keyframes wordFadeIn {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px) rotate(-5deg); }
    75% { transform: translateX(5px) rotate(5deg); }
}

.animated {
    animation-fill-mode: both;
    animation-duration: 1s;
}

.fade-in {
    animation-name: fadeIn;
}

.slide-up {
    animation-name: slideUp;
}

.zoom-in {
    animation-name: zoomIn;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes zoomIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
`;

// Injeta estilos de animação
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// Export para uso global
window.animations = {
    createMouseParticle,
    celebrateNumber,
    formatCurrency
};