document.addEventListener('DOMContentLoaded', () => {
    // Selecionar elementos
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.overlay');
    const submenuParents = document.querySelectorAll('.has-submenu');
    const header = document.querySelector('header');
    const logo = document.querySelector('.logo img');
    const segundaSeccion = document.querySelector('.seccion.conteudo');
    const galeriaSeccion = document.querySelector('.seccion.galeria'); // Nueva selección para la sección galería
    const cabecalho = document.querySelector('.cabecalho'); // Seleccionar la cabecera para el zoom

    // Código para el zoom de la imagen de cabecera
    if (cabecalho) {
        // Aplica zoom cuando se carga la página
        cabecalho.classList.add('zoom-in');

        // Alternar entre zoom in y zoom out cada cierto tiempo
        setInterval(() => {
            if (cabecalho.classList.contains('zoom-in')) {
                cabecalho.classList.remove('zoom-in');
                cabecalho.classList.add('zoom-out');
            } else {
                cabecalho.classList.remove('zoom-out');
                cabecalho.classList.add('zoom-in');
            }
        }, 15000); // Cambia cada 20 segundos (ajusta el tiempo según prefieras)
    }
    // Evento de clique no ícone de hamburguer
    menuIcon.addEventListener('click', () => {
        menuIcon.classList.toggle('active');
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    // Fechar o menu ao clicar na sobreposição
    overlay.addEventListener('click', () => {
        menuIcon.classList.remove('active');
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        submenuParents.forEach(parent => parent.classList.remove('submenu-active'));
    });

    // Evento de clique nos itens com submenu
    submenuParents.forEach(parent => {
        parent.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que o evento se propague
            parent.classList.toggle('submenu-active');
        });
    });

// Código para animar el texto línea por línea y el título al hacer scroll
const textosAnimados = document.querySelectorAll('.texto-animado');
const titulosAnimados = document.querySelectorAll('.titulo-animado'); // Seleccionar todos los títulos

// Animar títulos
if (titulosAnimados.length > 0) {
    const observerTitulo = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aparecer');
                observer.unobserve(entry.target); // Desconectar el observador para este título
            }
        });
    }, { threshold: 0.5 });

    titulosAnimados.forEach(titulo => observerTitulo.observe(titulo)); // Observar cada título
}

// Animar texto línea por línea
if (textosAnimados.length > 0) {
    textosAnimados.forEach(parrafo => {
        const texto = parrafo.getAttribute('data-texto');
        parrafo.innerHTML = ''; // Limpiamos el contenido del párrafo
        const lineas = dividirEnLineas(texto, parrafo);

        lineas.forEach(linea => {
            const spanLinea = document.createElement('span');
            spanLinea.classList.add('linha');
            spanLinea.textContent = linea;
            parrafo.appendChild(spanLinea);
            parrafo.appendChild(document.createElement('br')); // Añadimos un salto de línea
        });
    });

    const lineas = document.querySelectorAll('.linha');

    const options = {
        threshold: 1.0
    };

    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add('aparecer');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    lineas.forEach(linha => {
        observer.observe(linha);
    });
}


    // Código para hacer desaparecer el logo gradualmente al llegar a la segunda sección en index.html
    if (segundaSeccion && header && logo) {
        window.addEventListener('scroll', () => {
            const headerHeight = header.offsetHeight;
            const seccionRect = segundaSeccion.getBoundingClientRect();

            if (seccionRect.top <= headerHeight && seccionRect.bottom >= 0) {
                // El header está sobre la segunda sección
                logo.classList.add('ocultar-logo');
            } else {
                logo.classList.remove('ocultar-logo');
            }
        });
    }

    // Código para hacer desaparecer el logo gradualmente al llegar a la sección galería en projeto.html
    if (galeriaSeccion && header && logo) {
        window.addEventListener('scroll', () => {
            const headerHeight = header.offsetHeight;
            const galeriaRect = galeriaSeccion.getBoundingClientRect();

            if (galeriaRect.top <= headerHeight && galeriaRect.bottom >= 0) {
                // El header está sobre la sección galería
                logo.classList.add('ocultar-logo');
            } else {
                logo.classList.remove('ocultar-logo');
            }
        });
    }

     // Seleccionar todas las imágenes a animar
     const imagensAnimadas = document.querySelectorAll('.imagem-animada');

     if ('IntersectionObserver' in window) {
         const opcionesObserver = {
             threshold: 0.1
         };
 
         const observerImagens = new IntersectionObserver((entries, observer) => {
             entries.forEach(entry => {
                 if (entry.isIntersecting) {
                     entry.target.classList.add('aparecer');
                     observer.unobserve(entry.target); // Dejar de observar esta imagen
                 }
             });
         }, opcionesObserver);
 
         imagensAnimadas.forEach(imagem => {
             observerImagens.observe(imagem);
         });
     } else {
         // Fallback para navegadores que no soportan Intersection Observer
         imagensAnimadas.forEach(imagem => {
             imagem.classList.add('aparecer');
         });
     }

         // Seleccionar todas las imágenes del mosaico
    const itemsMosaico = document.querySelectorAll('.item-mosaico');

    // Array de clases de tamaño
    const tamanhos = ['wide', 'tall', 'medium', ''];

    // Asignar clase aleatoria a cada imagen
    itemsMosaico.forEach(item => {
        const tamanhoAleatorio = tamanhos[Math.floor(Math.random() * tamanhos.length)];
        if (tamanhoAleatorio) {
            item.classList.add(tamanhoAleatorio); // Asignar tamaño aleatorio
        }
    });
      
    
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    let currentIndex = 0;

    // Función para actualizar el slider
    function updateSlider() {
        const slideWidth = slides[0].offsetWidth;
        slider.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
    }

    // Evento para el botón de siguiente
    nextButton.addEventListener('click', () => {
        if (currentIndex < slides.length - 2) { // Mostrar 2 columnas
            currentIndex++;
        } else {
            currentIndex = 0; // Reiniciar al inicio
        }
        updateSlider();
    });

    // Evento para el botón de anterior
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = slides.length - 2; // Ir al final
        }
        updateSlider();
    });

    // Actualizar el slider al cargar la página
    window.addEventListener('resize', updateSlider);

    // Inicializar Hammer.js para el slider
    const hammer = new Hammer(slider);

    hammer.on('swipeleft', () => {
        slider.scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    });

    hammer.on('swiperight', () => {
        slider.scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    });
    
});

// Función para dividir el texto en líneas basadas en el ancho del párrafo
function dividirEnLineas(texto, elemento) {
    const words = texto.split(' ');
    const lines = [];
    let line = '';

    words.forEach((word, index) => {
        const testLine = line + word + ' ';
        const metrics = medirTexto(testLine, elemento);

        if (metrics.width > elemento.clientWidth && line !== '') {
            lines.push(line.trim());
            line = word + ' ';
        } else {
            line = testLine;
        }

        if (index === words.length - 1) {
            lines.push(line.trim());
        }
    });

    return lines;
}

// Función para medir el ancho de un texto dado un elemento
function medirTexto(texto, elemento) {
    const canvas = medirTexto.canvas || (medirTexto.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    const style = getComputedStyle(elemento);
    context.font = `${style.fontSize} ${style.fontFamily}`;
    const metrics = context.measureText(texto);
    return metrics;
}

let currentImageIndex = 0; // Índice de la imagen actual
let images = []; // Array para almacenar todas las imágenes de la galería

// Inicializar lightbox al hacer clic en una imagen
document.querySelectorAll('.item-mosaico img').forEach((img, index) => {
    img.addEventListener('click', () => {
        images = Array.from(document.querySelectorAll('.item-mosaico img')).map(image => image.src); // Guardar las URLs de las imágenes
        currentImageIndex = index;
        showLightboxImage(currentImageIndex); // Mostrar la imagen clicada
        document.getElementById('lightbox').style.display = 'block';
    });
});

// Mostrar la imagen en el lightbox
function showLightboxImage(index) {
    const lightboxImage = document.getElementById('lightbox-image');
    lightboxImage.src = images[index];
}

// Cerrar el lightbox al hacer clic en el botón de cierre
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('lightbox').style.display = 'none';
});

// Manejar el swipe con Hammer.js
const lightbox = document.getElementById('lightbox');
const hammer = new Hammer(lightbox);

hammer.on('swipeleft', () => {
    currentImageIndex = (currentImageIndex === images.length - 1) ? 0 : currentImageIndex + 1;
    showLightboxImage(currentImageIndex);
});

hammer.on('swiperight', () => {
    currentImageIndex = (currentImageIndex === 0) ? images.length - 1 : currentImageIndex - 1;
    showLightboxImage(currentImageIndex);
});
