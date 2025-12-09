// ============================================
// SISTEMA DE TRACKING DE VISITANTES
// ============================================

(function() {
    'use strict';

    // Detectar se é mobile ou desktop
    const isMobile = window.innerWidth <= 768;
    const deviceType = isMobile ? 'mobile' : 'desktop';

    // Gerar ou recuperar ID único para esta sessão do navegador
    let sessionId = sessionStorage.getItem('visitor_session_id');
    if (!sessionId) {
        sessionId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('visitor_session_id', sessionId);
    }
    
    // Recuperar dados da sessão existente ou criar nova
    let sessionData = null;
    try {
        const stored = sessionStorage.getItem('visitor_session_data');
        if (stored) {
            sessionData = JSON.parse(stored);
            // Verificar se o sessionId ainda corresponde
            if (sessionData.sessionId !== sessionId) {
                sessionData = null; // Criar nova sessão se o ID mudou
            }
        }
    } catch (e) {
        console.error('Erro ao recuperar dados da sessão:', e);
    }
    
    if (!sessionData) {
        // Nova sessão
        sessionData = {
            sessionId: sessionId,
            deviceType: deviceType,
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            entryTime: new Date().toISOString(),
            exitTime: null,
            pages: [],
            clicks: [],
            currentPage: {
                url: window.location.pathname,
                title: document.title,
                entryTime: Date.now(),
                exitTime: null,
                loadTime: null,
                timeSpent: 0
            }
        };
    } else {
        // Sessão existente - atualizar apenas a página atual
        sessionData.currentPage = {
            url: window.location.pathname,
            title: document.title,
            entryTime: Date.now(),
            exitTime: null,
            loadTime: null,
            timeSpent: 0
        };
    }

    // Medir tempo de carregamento da página atual
    let pageLoadStart = performance.timing.navigationStart || performance.timing.fetchStart;
    let pageLoadEnd = performance.timing.loadEventEnd || Date.now();
    sessionData.currentPage.loadTime = pageLoadEnd - pageLoadStart;

    // Função para salvar dados da página atual
    function savePageData() {
        if (sessionData.currentPage.entryTime) {
            sessionData.currentPage.exitTime = Date.now();
            sessionData.currentPage.timeSpent = sessionData.currentPage.exitTime - sessionData.currentPage.entryTime;
            
            // Adicionar à lista de páginas (evitar duplicatas)
            const existingPageIndex = sessionData.pages.findIndex(p => p.url === sessionData.currentPage.url);
            if (existingPageIndex >= 0) {
                // Atualizar página existente
                sessionData.pages[existingPageIndex].timeSpent += sessionData.currentPage.timeSpent;
                sessionData.pages[existingPageIndex].visits = (sessionData.pages[existingPageIndex].visits || 1) + 1;
                // Atualizar loadTime se for mais recente
                if (sessionData.currentPage.loadTime) {
                    sessionData.pages[existingPageIndex].loadTime = sessionData.currentPage.loadTime;
                }
            } else {
                // Adicionar nova página
                sessionData.pages.push({
                    url: sessionData.currentPage.url,
                    title: sessionData.currentPage.title,
                    timeSpent: sessionData.currentPage.timeSpent,
                    loadTime: sessionData.currentPage.loadTime,
                    visits: 1
                });
            }
        }
        
        // Salvar no sessionStorage para persistir entre páginas
        sessionStorage.setItem('visitor_session_data', JSON.stringify(sessionData));
    }

    // Função para enviar dados ao servidor
    function sendTrackingData() {
        sessionData.exitTime = new Date().toISOString();
        
        // Calcular tempo total no site
        const entryTime = new Date(sessionData.entryTime).getTime();
        const exitTime = new Date(sessionData.exitTime).getTime();
        sessionData.totalTimeSpent = exitTime - entryTime;

        fetch('/save_tracking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData)
        }).catch(err => {
            console.error('Erro ao salvar tracking:', err);
        });
    }

    // Rastrear cliques
    document.addEventListener('click', (e) => {
        const target = e.target;
        const clickData = {
            timestamp: new Date().toISOString(),
            url: window.location.pathname,
            element: {
                tag: target.tagName.toLowerCase(),
                id: target.id || null,
                className: target.className || null,
                text: target.textContent ? target.textContent.substring(0, 50) : null,
                href: target.href || (target.closest('a') ? target.closest('a').href : null)
            },
            position: {
                x: e.clientX,
                y: e.clientY
            }
        };
        
        sessionData.clicks.push(clickData);
        
        // Limitar a 100 cliques por sessão para não ficar muito pesado
        if (sessionData.clicks.length > 100) {
            sessionData.clicks.shift();
        }
        
        // Salvar no sessionStorage
        sessionStorage.setItem('visitor_session_data', JSON.stringify(sessionData));
    });

    // Rastrear mudanças de página (SPA ou navegação)
    let lastUrl = window.location.pathname;
    
    function trackPageChange() {
        const currentUrl = window.location.pathname;
        
        if (currentUrl !== lastUrl) {
            // Salvar dados da página anterior
            savePageData();
            
            // Iniciar tracking da nova página
            sessionData.currentPage = {
                url: currentUrl,
                title: document.title,
                entryTime: Date.now(),
                exitTime: null,
                loadTime: null,
                timeSpent: 0
            };
            
            // Medir tempo de carregamento
            pageLoadStart = performance.timing.navigationStart || Date.now();
            setTimeout(() => {
                pageLoadEnd = performance.timing.loadEventEnd || Date.now();
                sessionData.currentPage.loadTime = pageLoadEnd - pageLoadStart;
                // Salvar no sessionStorage após medir loadTime
                sessionStorage.setItem('visitor_session_data', JSON.stringify(sessionData));
            }, 100);
            
            // Salvar no sessionStorage imediatamente
            sessionStorage.setItem('visitor_session_data', JSON.stringify(sessionData));
            
            lastUrl = currentUrl;
        }
    }

    // Observar mudanças na URL usando History API
    
    // Interceptar pushState e replaceState para SPAs
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
        originalPushState.apply(history, arguments);
        setTimeout(trackPageChange, 0);
    };
    
    history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
        setTimeout(trackPageChange, 0);
    };
    
    window.addEventListener('popstate', () => {
        setTimeout(trackPageChange, 0);
    });

    // Rastrear antes de sair da página
    window.addEventListener('beforeunload', () => {
        savePageData();
        sendTrackingData();
    });

    // Rastrear quando a página fica oculta (mudança de aba, etc)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            savePageData();
        } else {
            // Atualizar tempo de entrada quando volta
            sessionData.currentPage.entryTime = Date.now();
        }
    });

    // Enviar dados periodicamente (a cada 30 segundos) para não perder dados
    setInterval(() => {
        savePageData();
        // Enviar dados ao servidor periodicamente também
        const entryTime = new Date(sessionData.entryTime).getTime();
        const now = Date.now();
        sessionData.totalTimeSpent = now - entryTime;
        
        fetch('/save_tracking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData)
        }).catch(err => {
            console.error('Erro ao salvar tracking:', err);
        });
    }, 30000);

    // Enviar dados ao sair (usando sendBeacon para garantir envio)
    window.addEventListener('pagehide', () => {
        savePageData();
        sessionData.exitTime = new Date().toISOString();
        
        const entryTime = new Date(sessionData.entryTime).getTime();
        const exitTime = new Date(sessionData.exitTime).getTime();
        sessionData.totalTimeSpent = exitTime - entryTime;

        // Usar sendBeacon para garantir envio mesmo ao fechar a página
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(sessionData)], { type: 'application/json' });
            navigator.sendBeacon('/save_tracking', blob);
        } else {
            // Fallback: tentar enviar de forma síncrona
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/save_tracking', false); // false = síncrono
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(sessionData));
        }
        
        // Limpar sessionStorage após enviar (com delay para garantir envio)
        setTimeout(() => {
            sessionStorage.removeItem('visitor_session_id');
            sessionStorage.removeItem('visitor_session_data');
        }, 1000);
    });

    // Inicializar tracking da página atual
    trackPageChange();
})();

