// ============================================
// GERENCIAMENTO DE CAMPANHAS NO SITE
// ============================================

(function() {
    'use strict';

    let campanhas = [];
    let currentSlide = 0;
    let autoPlayInterval = null;
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let isDragging = false;
    let isHovering = false;

    // Carregar campanhas ativas
    async function loadCampanhas() {
        try {
            const response = await fetch('/get_campanhas');
            if (!response.ok) throw new Error('Erro ao carregar campanhas');
            const allCampanhas = await response.json();
            campanhas = allCampanhas.filter(c => c.active);
            
            if (campanhas.length > 0) {
                initCampanhas();
            }
        } catch (error) {
            console.error('Erro ao carregar campanhas:', error);
        }
    }

    // Inicializar campanhas
    function initCampanhas() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            initMobileCampanhas();
        } else {
            initDesktopCampanhas();
        }
    }

    // ============================================
    // POPUP DESKTOP
    // ============================================
    function initDesktopCampanhas() {
        const popup = document.getElementById('campanhas-popup-desktop');
        const overlay = document.getElementById('campanhas-overlay');
        const slidesContainer = document.querySelector('.campanhas-slides');
        const dotsContainer = document.querySelector('.campanhas-dots');
        const closeBtn = document.querySelector('.campanhas-close');
        const prevBtn = document.querySelector('.campanhas-prev');
        const nextBtn = document.querySelector('.campanhas-next');

        if (!popup || !slidesContainer) return;

        // Criar slides
        slidesContainer.innerHTML = campanhas.map((c, i) => `
            <div class="campanha-slide ${i === 0 ? 'active' : ''}" data-index="${i}" data-link="${c.link}">
                <img src="/static/${c.image}" alt="${c.title}" loading="lazy">
            </div>
        `).join('');

        // Criar dots
        if (campanhas.length > 1) {
            dotsContainer.innerHTML = campanhas.map((c, i) => `
                <span class="campanha-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
            `).join('');
        }

        // Event listeners
        closeBtn.addEventListener('click', closeDesktopPopup);
        overlay.addEventListener('click', closeDesktopPopup);
        
        if (campanhas.length > 1) {
            prevBtn.addEventListener('click', () => changeSlide(-1));
            nextBtn.addEventListener('click', () => changeSlide(1));
            
            // Dots navigation
            dotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('campanha-dot')) {
                    const index = parseInt(e.target.dataset.index);
                    goToSlide(index);
                }
            });
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }

        // Click na imagem abre o link
        slidesContainer.addEventListener('click', (e) => {
            const slide = e.target.closest('.campanha-slide');
            if (slide && slide.dataset.link) {
                window.open(slide.dataset.link, '_blank');
            }
        });

        // Pausar auto-play ao hover no popup
        popup.addEventListener('mouseenter', () => {
            isHovering = true;
            stopAutoPlay();
        });

        popup.addEventListener('mouseleave', () => {
            isHovering = false;
            if (campanhas.length > 1) {
                startAutoPlay();
            }
        });

        // Mostrar popup após 2 segundos
        setTimeout(() => {
            overlay.classList.add('show');
            popup.classList.add('show');
            
            // Pausar slideshow principal
            pauseMainSlideshow();
            
            // Auto-play se houver múltiplas campanhas
            if (campanhas.length > 1) {
                startAutoPlay();
            }
        }, 2000);
    }

    function changeSlide(direction) {
        stopAutoPlay();
        const slides = document.querySelectorAll('.campanha-slide');
        const dots = document.querySelectorAll('.campanha-dot');
        
        const oldSlide = currentSlide;
        let newIndex = currentSlide + direction;
        if (newIndex < 0) {
            newIndex = campanhas.length - 1;
        } else if (newIndex >= campanhas.length) {
            newIndex = 0;
        }
        currentSlide = newIndex;
        
        // Primeiro: fade in da nova imagem sobre a atual
        slides[currentSlide].classList.add('active');
        if (dots.length) dots[currentSlide].classList.add('active');
        
        // Depois: fade out da imagem anterior (com delay)
        setTimeout(() => {
            slides[oldSlide].classList.remove('active');
            if (dots.length) dots[oldSlide].classList.remove('active');
        }, 100);
        
        // Só reinicia auto-play se o mouse não estiver sobre o popup
        if (!isHovering) {
            startAutoPlay();
        }
    }

    function goToSlide(index) {
        stopAutoPlay();
        const slides = document.querySelectorAll('.campanha-slide');
        const dots = document.querySelectorAll('.campanha-dot');
        
        const oldSlide = currentSlide;
        currentSlide = index;
        
        // Primeiro: fade in da nova imagem sobre a atual
        slides[currentSlide].classList.add('active');
        if (dots.length) dots[currentSlide].classList.add('active');
        
        // Depois: fade out da imagem anterior (com delay)
        setTimeout(() => {
            slides[oldSlide].classList.remove('active');
            if (dots.length) dots[oldSlide].classList.remove('active');
        }, 100);
        
        // Só reinicia auto-play se o mouse não estiver sobre o popup
        if (!isHovering) {
            startAutoPlay();
        }
    }

    function startAutoPlay() {
        if (campanhas.length <= 1) return;
        stopAutoPlay();
        autoPlayInterval = setInterval(() => {
            changeSlide(1);
        }, 8000); // Aumentado para 8 segundos
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    function closeDesktopPopup() {
        const popup = document.getElementById('campanhas-popup-desktop');
        const overlay = document.getElementById('campanhas-overlay');
        
        popup.classList.remove('show');
        overlay.classList.remove('show');
        stopAutoPlay();
        
        // Retomar slideshow principal
        resumeMainSlideshow();
    }

    // ============================================
    // NOTIFICAÇÃO MOBILE (BOTTOM SHEET)
    // ============================================
    function initMobileCampanhas() {
        const mobile = document.getElementById('campanhas-mobile');
        const overlay = document.getElementById('campanhas-overlay');
        const sliderContainer = document.querySelector('.campanhas-mobile-slider');
        const dotsContainer = document.querySelector('.campanhas-dots-mobile');
        const closeBtn = document.querySelector('.campanhas-close-mobile');

        if (!mobile || !sliderContainer) return;

        // Criar slides
        sliderContainer.innerHTML = campanhas.map((c, i) => {
            if (i === 0) {
                return `<div class="campanha-slide-mobile active" data-index="${i}" data-link="${c.link}">
                    <img src="/static/${c.image}" alt="${c.title}" loading="lazy">
                </div>`;
            } else {
                return `<div class="campanha-slide-mobile" data-index="${i}" data-link="${c.link}">
                    <img src="/static/${c.image}" alt="${c.title}" loading="lazy">
                </div>`;
            }
        }).join('');

        // Criar dots dentro do slider container (sobrepostos na imagem)
        if (campanhas.length > 1) {
            if (!dotsContainer) {
                // Criar container de dots se não existir
                const newDotsContainer = document.createElement('div');
                newDotsContainer.className = 'campanhas-dots-mobile';
                sliderContainer.appendChild(newDotsContainer);
                dotsContainer = newDotsContainer;
            }
            dotsContainer.innerHTML = campanhas.map((c, i) => `
                <span class="campanha-dot-mobile ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
            `).join('');
            console.log('Dots criados:', dotsContainer.innerHTML);
        }

        // Mostrar notificação após 2 segundos com animação suave
        setTimeout(() => {
            // Primeiro mostrar o elemento com estado inicial (fora da tela)
            mobile.style.display = 'block';
            mobile.style.opacity = '0';
            mobile.style.transform = 'translateY(100%)';
            mobile.style.transition = 'none'; // Sem transição no estado inicial
            
            // Forçar reflow para garantir que o estado inicial seja aplicado
            void mobile.offsetHeight;
            
            // Agora aplicar a transição e animar
            setTimeout(() => {
                mobile.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                overlay.classList.add('show');
                mobile.classList.add('show');
                
                // Pausar slideshow principal
                pauseMainSlideshow();
                
                // Auto-play se houver múltiplas campanhas
                if (campanhas.length > 1) {
                    startAutoPlayMobile();
                }
            }, 20);
        }, 2000);

        // Event listeners
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeMobileNotification();
                }
            });
        }

        // Variáveis para swipe
        let sliderTouchStartX = 0;
        let sliderTouchStartY = 0;
        let sliderTouchEndX = 0;
        let sliderTouchEndY = 0;
        
        let mobileTouchStartY = 0;
        let mobileTouchEndY = 0;
        let mobileTouchStartX = 0;
        let mobileTouchEndX = 0;

        // Swipe support no slider (horizontal para trocar slides) - apenas se houver mais de uma campanha
        if (campanhas.length > 1) {
            sliderContainer.addEventListener('touchstart', (e) => {
                sliderTouchStartX = e.touches[0].clientX;
                sliderTouchStartY = e.touches[0].clientY;
                e.stopPropagation(); // Evitar que o evento chegue ao mobile
            }, { passive: true });
            
            sliderContainer.addEventListener('touchmove', (e) => {
                sliderTouchEndX = e.touches[0].clientX;
                sliderTouchEndY = e.touches[0].clientY;
            }, { passive: true });
            
            sliderContainer.addEventListener('touchend', (e) => {
                const swipeThreshold = 50;
                const diffX = sliderTouchStartX - sliderTouchEndX;
                const diffY = sliderTouchStartY - sliderTouchEndY;

                // Se o movimento horizontal for maior que o vertical, é um swipe horizontal
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (diffX > 0) {
                        // Swipe left - próximo
                        changeSlideMobile(1);
                    } else {
                        // Swipe right - anterior
                        changeSlideMobile(-1);
                    }
                }
                
                // Reset valores
                sliderTouchStartX = 0;
                sliderTouchStartY = 0;
                sliderTouchEndX = 0;
                sliderTouchEndY = 0;
            }, { passive: false });
        }

        // Swipe down na notificação inteira também fecha (apenas vertical)
        // Funciona sempre, independente do número de campanhas
        mobile.addEventListener('touchstart', (e) => {
            mobileTouchStartY = e.touches[0].clientY;
            mobileTouchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        mobile.addEventListener('touchmove', (e) => {
            mobileTouchEndY = e.touches[0].clientY;
            mobileTouchEndX = e.touches[0].clientX;
        }, { passive: true });
        
        mobile.addEventListener('touchend', (e) => {
            const swipeThreshold = 50;
            const diffY = mobileTouchStartY - mobileTouchEndY;
            const diffX = Math.abs(mobileTouchStartX - mobileTouchEndX);
            
            // Apenas swipe down fecha (movimento para baixo e principalmente vertical)
            // Prioriza movimento vertical sobre horizontal
            if (diffY < -swipeThreshold && Math.abs(diffY) > diffX * 1.5) {
                closeMobileNotification();
            }
            
            // Reset valores
            mobileTouchStartY = 0;
            mobileTouchEndY = 0;
            mobileTouchStartX = 0;
            mobileTouchEndX = 0;
        });

        // Dots navigation
        if (campanhas.length > 1) {
            dotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('campanha-dot-mobile')) {
                    const index = parseInt(e.target.dataset.index);
                    goToSlideMobile(index);
                }
            });
        }

        // Click na imagem abre o link
        sliderContainer.addEventListener('click', (e) => {
            const slide = e.target.closest('.campanha-slide-mobile');
            if (slide && slide.dataset.link) {
                window.open(slide.dataset.link, '_blank');
            }
        });
    }

    // Funções de swipe removidas - agora tratadas diretamente nos event listeners

    function changeSlideMobile(direction) {
        // Não permitir trocar se houver apenas uma campanha
        if (campanhas.length <= 1) return;
        
        stopAutoPlayMobile();
        const slides = document.querySelectorAll('.campanha-slide-mobile');
        const dots = document.querySelectorAll('.campanha-dot-mobile');
        
        const oldSlide = currentSlide;
        
        // Calcular novo índice com loop infinito
        let newIndex = currentSlide + direction;
        if (newIndex < 0) {
            newIndex = campanhas.length - 1; // Vai para a última
        } else if (newIndex >= campanhas.length) {
            newIndex = 0; // Vai para a primeira
        }
        
        currentSlide = newIndex;
        
        // Primeiro: fade in da nova imagem sobre a atual
        slides[currentSlide].classList.add('active');
        if (dots.length) {
            dots[currentSlide].classList.add('active');
        }
        
        // Depois: fade out da imagem anterior (com delay)
        setTimeout(() => {
            slides[oldSlide].classList.remove('active');
            if (dots.length) {
                dots[oldSlide].classList.remove('active');
            }
        }, 100);
        
        startAutoPlayMobile();
    }

    function goToSlideMobile(index) {
        if (index === currentSlide) return;
        
        stopAutoPlayMobile();
        const slides = document.querySelectorAll('.campanha-slide-mobile');
        const dots = document.querySelectorAll('.campanha-dot-mobile');
        
        const oldSlide = currentSlide;
        currentSlide = index;
        
        // Primeiro: fade in da nova imagem sobre a atual
        slides[currentSlide].classList.add('active');
        if (dots.length) {
            dots[currentSlide].classList.add('active');
        }
        
        // Depois: fade out da imagem anterior (com delay)
        setTimeout(() => {
            slides[oldSlide].classList.remove('active');
            if (dots.length) {
                dots[oldSlide].classList.remove('active');
            }
        }, 100);
        
        startAutoPlayMobile();
    }

    function startAutoPlayMobile() {
        if (campanhas.length <= 1) return;
        stopAutoPlayMobile();
        autoPlayInterval = setInterval(() => {
            changeSlideMobile(1);
        }, 8000); // Aumentado para 8 segundos
    }

    function stopAutoPlayMobile() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    function closeMobileNotification() {
        const mobile = document.getElementById('campanhas-mobile');
        const overlay = document.getElementById('campanhas-overlay');
        
        if (!mobile) return;
        
        // Adicionar classe de animação de saída
        mobile.classList.add('hiding');
        mobile.classList.remove('show');
        if (overlay) {
            overlay.classList.remove('show');
        }
        stopAutoPlayMobile();
        
        // Retomar slideshow principal
        resumeMainSlideshow();
        
        // Remover após animação
        setTimeout(() => {
            mobile.classList.remove('hiding');
            mobile.style.display = 'none';
        }, 500);
    }

    // Funções para pausar/retomar slideshow principal
    function pauseMainSlideshow() {
        const slides = document.querySelectorAll('.slideshow .slide');
        slides.forEach(slide => {
            slide.style.animationPlayState = 'paused';
        });
    }

    function resumeMainSlideshow() {
        const slides = document.querySelectorAll('.slideshow .slide');
        slides.forEach(slide => {
            slide.style.animationPlayState = 'running';
        });
    }

    // Inicializar ao carregar a página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadCampanhas);
    } else {
        loadCampanhas();
    }

    // Keyboard navigation (ESC para fechar)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDesktopPopup();
            closeMobileNotification();
        }
    });

})();

