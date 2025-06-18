/* ========================================
   NOTIFICATIONS.JS - Sistema de Notificações
   ======================================== */

// Configurações de Notificações
const NOTIFICATION_CONFIG = {
    defaultDuration: 5000,
    animationDuration: 500,
    maxNotifications: 3,
    position: 'bottom-left',
    types: {
        success: { icon: 'fas fa-check-circle', color: 'var(--green)' },
        warning: { icon: 'fas fa-exclamation-triangle', color: 'var(--gold)' },
        error: { icon: 'fas fa-times-circle', color: 'var(--red)' },
        info: { icon: 'fas fa-info-circle', color: 'var(--blue)' },
        winner: { icon: 'fas fa-trophy', color: 'var(--gold)' },
        urgent: { icon: 'fas fa-bell', color: 'var(--red)' }
    }
};

// Lista de notificações de ganhadores
const WINNER_NOTIFICATIONS = [
    { name: 'João Silva', amount: 'R$ 1.000', avatar: 2 },
    { name: 'Maria Oliveira', amount: 'R$ 500', avatar: 5 },
    { name: 'Pedro Santos', amount: 'R$ 2.500', avatar: 3 },
    { name: 'Ana Costa', amount: 'R$ 800', avatar: 9 },
    { name: 'Carlos Mendes', amount: 'R$ 3.000', avatar: 7 },
    { name: 'Juliana Lima', amount: 'R$ 1.500', avatar: 8 },
    { name: 'Roberto Alves', amount: 'R$ 4.000', avatar: 11 },
    { name: 'Patrícia Souza', amount: 'R$ 600', avatar: 15 },
    { name: 'Fernando Costa', amount: 'R$ 5.000', avatar: 18 },
    { name: 'Camila Rocha', amount: 'R$ 2.000', avatar: 22 }
];

// Estado do sistema de notificações
const notificationState = {
    queue: [],
    activeNotifications: [],
    lastWinnerIndex: 0,
    isPaused: false
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initializeNotifications();
});

function initializeNotifications() {
    // Cria container de notificações se não existir
    createNotificationContainer();
    
    // Inicia notificações automáticas de ganhadores
    startWinnerNotifications();
    
    // Configura notificação principal (a que já existe no HTML)
    setupMainNotification();
    
    // Adiciona listeners para pausar notificações
    setupNotificationControls();
    
    // Testa diferentes tipos de notificação (remover em produção)
    if (window.location.hash === '#debug') {
        testNotifications();
    }
}

// Cria container para notificações dinâmicas
function createNotificationContainer() {
    let container = document.getElementById('notification-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 30px;
            z-index: 1000;
            display: flex;
            flex-direction: column-reverse;
            gap: 15px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    return container;
}

// Configura a notificação principal do HTML
function setupMainNotification() {
    const mainNotification = document.getElementById('notification');
    if (!mainNotification) return;
    
    // Adiciona funcionalidade de fechar
    const closeButton = mainNotification.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            hideNotification(mainNotification);
        });
    }
    
    // Auto-hide após hover
    mainNotification.addEventListener('mouseenter', () => {
        notificationState.isPaused = true;
    });
    
    mainNotification.addEventListener('mouseleave', () => {
        notificationState.isPaused = false;
    });
}

// Inicia ciclo de notificações de ganhadores
function startWinnerNotifications() {
    // Primeira notificação após 5 segundos
    setTimeout(() => {
        showRandomWinnerNotification();
    }, 5000);
    
    // Notificações subsequentes a cada 15 segundos
    setInterval(() => {
        if (!notificationState.isPaused && notificationState.activeNotifications.length < NOTIFICATION_CONFIG.maxNotifications) {
            showRandomWinnerNotification();
        }
    }, 15000);
}

// Mostra notificação aleatória de ganhador
function showRandomWinnerNotification() {
    const winner = WINNER_NOTIFICATIONS[notificationState.lastWinnerIndex];
    notificationState.lastWinnerIndex = (notificationState.lastWinnerIndex + 1) % WINNER_NOTIFICATIONS.length;
    
    // Alterna entre notificação principal e notificações dinâmicas
    if (Math.random() > 0.5) {
        // Usa a notificação principal
        updateMainNotification(winner);
    } else {
        // Cria nova notificação dinâmica
        showNotification({
            title: '🎉 Novo Ganhador!',
            message: `${winner.name} acabou de ganhar ${winner.amount}!`,
            type: 'winner',
            avatar: `https://i.pravatar.cc/50?img=${winner.avatar}`,
            duration: 6000
        });
    }
}

// Atualiza a notificação principal
function updateMainNotification(winner) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    const img = notification.querySelector('img');
    const text = notification.querySelector('.notification-text');
    
    if (img) {
        img.src = `https://i.pravatar.cc/50?img=${winner.avatar}`;
        img.alt = `Foto de ${winner.name}`;
    }
    
    if (text) {
        text.textContent = `${winner.name} acabou de ganhar ${winner.amount}!`;
    }
    
    // Mostra com animação
    notification.classList.remove('show');
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-hide após duração
    setTimeout(() => {
        if (!notificationState.isPaused) {
            notification.classList.remove('show');
        }
    }, NOTIFICATION_CONFIG.defaultDuration);
}

// Sistema de notificações dinâmicas
function showNotification(options) {
    const config = {
        title: '',
        message: '',
        type: 'info',
        duration: NOTIFICATION_CONFIG.defaultDuration,
        avatar: null,
        closable: true,
        onClick: null,
        ...options
    };
    
    // Cria elemento da notificação
    const notification = createNotificationElement(config);
    
    // Adiciona ao container
    const container = document.getElementById('notification-container');
    container.appendChild(notification);
    
    // Adiciona à lista de notificações ativas
    notificationState.activeNotifications.push(notification);
    
    // Anima entrada
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Auto-remove após duração
    const removeTimeout = setTimeout(() => {
        hideNotification(notification);
    }, config.duration);
    
    // Salva timeout para poder cancelar se necessário
    notification.dataset.timeout = removeTimeout;
    
    // Remove notificações antigas se exceder o máximo
    if (notificationState.activeNotifications.length > NOTIFICATION_CONFIG.maxNotifications) {
        const oldest = notificationState.activeNotifications.shift();
        hideNotification(oldest);
    }
    
    return notification;
}

// Cria elemento HTML da notificação
function createNotificationElement(config) {
    const notification = document.createElement('div');
    notification.className = 'dynamic-notification';
    notification.style.cssText = `
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.85) 100%);
        backdrop-filter: blur(20px);
        border: 2px solid ${NOTIFICATION_CONFIG.types[config.type].color};
        border-radius: 15px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        transform: translateX(-400px);
        transition: all 0.5s ease;
        cursor: ${config.onClick ? 'pointer' : 'default'};
        pointer-events: all;
        max-width: 350px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        position: relative;
    `;
    
    // Avatar ou ícone
    if (config.avatar) {
        const img = document.createElement('img');
        img.src = config.avatar;
        img.alt = 'Avatar';
        img.style.cssText = `
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 2px solid ${NOTIFICATION_CONFIG.types[config.type].color};
        `;
        notification.appendChild(img);
    } else {
        const icon = document.createElement('i');
        icon.className = NOTIFICATION_CONFIG.types[config.type].icon;
        icon.style.cssText = `
            font-size: 30px;
            color: ${NOTIFICATION_CONFIG.types[config.type].color};
        `;
        notification.appendChild(icon);
    }
    
    // Conteúdo
    const content = document.createElement('div');
    content.style.flex = '1';
    
    if (config.title) {
        const title = document.createElement('strong');
        title.style.cssText = `
            display: block;
            color: ${NOTIFICATION_CONFIG.types[config.type].color};
            margin-bottom: 5px;
            font-size: 16px;
        `;
        title.textContent = config.title;
        content.appendChild(title);
    }
    
    if (config.message) {
        const message = document.createElement('p');
        message.style.cssText = `
            margin: 0;
            color: #ccc;
            font-size: 14px;
            line-height: 1.4;
        `;
        message.textContent = config.message;
        content.appendChild(message);
    }
    
    notification.appendChild(content);
    
    // Botão de fechar
    if (config.closable) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 5px;
            font-size: 18px;
            transition: color 0.3s;
        `;
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hideNotification(notification);
        });
        notification.appendChild(closeBtn);
    }
    
    // Click handler
    if (config.onClick) {
        notification.addEventListener('click', config.onClick);
    }
    
    // Hover effects
    notification.addEventListener('mouseenter', () => {
        notification.style.transform = 'translateX(10px)';
        clearTimeout(parseInt(notification.dataset.timeout));
    });
    
    notification.addEventListener('mouseleave', () => {
        notification.style.transform = 'translateX(0)';
        const newTimeout = setTimeout(() => {
            hideNotification(notification);
        }, 2000);
        notification.dataset.timeout = newTimeout;
    });
    
    return notification;
}

// Esconde e remove notificação
function hideNotification(notification) {
    notification.classList.remove('show');
    notification.style.transform = 'translateX(-400px)';
    
    setTimeout(() => {
        notification.remove();
        const index = notificationState.activeNotifications.indexOf(notification);
        if (index > -1) {
            notificationState.activeNotifications.splice(index, 1);
        }
    }, NOTIFICATION_CONFIG.animationDuration);
}

// Controles de notificação
function setupNotificationControls() {
    // Pausa notificações quando o usuário está interagindo com formulários
    document.addEventListener('focusin', (e) => {
        if (e.target.matches('input, textarea, select')) {
            notificationState.isPaused = true;
        }
    });
    
    document.addEventListener('focusout', (e) => {
        if (e.target.matches('input, textarea, select')) {
            notificationState.isPaused = false;
        }
    });
    
    // Pausa quando a aba não está visível
    document.addEventListener('visibilitychange', () => {
        notificationState.isPaused = document.hidden;
    });
}

// Função para testes (remover em produção)
function testNotifications() {
    const types = Object.keys(NOTIFICATION_CONFIG.types);
    let index = 0;
    
    setInterval(() => {
        const type = types[index % types.length];
        showNotification({
            title: `Notificação ${type}`,
            message: `Esta é uma notificação de teste do tipo ${type}`,
            type: type,
            duration: 3000
        });
        index++;
    }, 4000);
}

// API pública
window.showNotification = showNotification;
window.hideNotification = hideNotification;

// Adiciona estilos CSS necessários
const notificationStyles = `
.dynamic-notification.show {
    transform: translateX(0) !important;
}

.dynamic-notification:hover .notification-close {
    color: #fff;
}

@media (max-width: 768px) {
    #notification-container {
        left: 10px !important;
        right: 10px !important;
        bottom: 100px !important;
    }
    
    .dynamic-notification {
        max-width: none !important;
    }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Export para uso global
window.notificationSystem = {
    showNotification,
    hideNotification,
    updateMainNotification,
    pauseNotifications: () => { notificationState.isPaused = true; },
    resumeNotifications: () => { notificationState.isPaused = false; }
};