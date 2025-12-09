document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const menuLinks = document.querySelectorAll(".menu a");
    const sections = document.querySelectorAll("section");

    // Alternar el menú hamburguesa
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });

    // Función para mostrar una sección específica
    function showSection(sectionId) {
        // Remover la clase 'active' de todos los enlaces del menú
        menuLinks.forEach(link => link.classList.remove("active"));

        // Ocultar todas las secciones
        sections.forEach(section => section.classList.add("hidden-section"));
        sections.forEach(section => section.classList.remove("active-section"));

        // Mostrar la sección correspondiente
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove("hidden-section");
            targetSection.classList.add("active-section");
            
            // Encontrar y activar el enlace correspondiente
            const activeLink = document.querySelector(`a[data-section="${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add("active");
            }
        }
    }

    // Cambiar entre secciones en el menú
    menuLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            const sectionId = this.getAttribute("data-section");
            
            // Actualizar la URL con hash
            window.location.hash = sectionId;
            
            // Mostrar la sección
            showSection(sectionId);

            // Cerrar el menú en dispositivos pequeños
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("active");
            }
        });
    });

    // Cargar la sección desde el hash al cargar la página o cambiar el hash
    function loadSectionFromHash() {
        const hash = window.location.hash.substring(1); // Remover el #
        if (hash) {
            showSection(hash);
        } else {
            // Si no hay hash, mostrar la primera sección activa o la primera disponible
            const firstActive = document.querySelector(".active-section");
            if (!firstActive && sections.length > 0) {
                const firstSectionId = sections[0].id;
                showSection(firstSectionId);
                // Actualizar el hash también
                window.location.hash = firstSectionId;
            }
        }
    }

    // Cargar sección al cargar la página
    loadSectionFromHash();

    // Escuchar cambios en el hash (navegación del navegador)
    window.addEventListener("hashchange", loadSectionFromHash);

    // Función para cargar los archivos y carpetas del directorio /projetos
    const fileList = document.getElementById("file-list");
    const currentPath = document.getElementById("current-path");

    function loadFiles(path = 'img/projetos') {
        fetch(`/list_files?path=${encodeURIComponent(path)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                } else {
                    // Limpiar la lista actual y actualizar la ruta
                    fileList.innerHTML = ''; // Limpiar la lista actual

                    // Actualizar la ruta como clicable
                    updateBreadcrumb(path);

                    // Listar carpetas con íconos
                    data.folders.forEach(folder => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <span class="folder-icon"><i class="fas fa-folder"></i></span> 
                            <a href="#" class="folder-link" data-path="${folder.path}">${folder.name}</a>
                            <button class="delete-btn" data-path="${folder.path}" data-type="folder"><i class="fas fa-trash"></i></button>
                            <button class="rename-btn" data-path="${folder.path}" data-type="folder"><i class="fas fa-edit"></i></button>
                        `;
                        fileList.appendChild(li);
                    });

                    // Listar archivos con íconos
                    // Listar archivos con íconos
                    data.files.forEach(file => {
                        let icon = 'fa-file'; // Icono por defecto para archivo
                        const fileExtension = file.name.split('.').pop().toLowerCase();
                    
                        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                            icon = 'fa-file-image'; // Cambia a icono de imagen si es imagen
                        }
                    
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <span class="file-icon"><i class="fas ${icon}"></i></span> 
                            <a href="/static/${file.path}" target="_blank">${file.name}</a> <!-- Enlace al archivo -->
                            <button class="delete-btn" data-path="${file.path}" data-type="file"><i class="fas fa-trash"></i></button>
                            <button class="rename-btn" data-path="${file.path}" data-type="file"><i class="fas fa-edit"></i></button>
                            ${file.name === "info.json" ? `
                                <button class="edit-json-btn" data-path="${file.path}">
                                    <i class="fas fa-pen"></i> Editar
                                </button>` : ''}
                        `;
                        fileList.appendChild(li);
                    });
                    

                    // Agregar eventos
                    setupDeleteButtons();
                    setupRenameButtons();
                    setupFolderNavigation();
                    setupEditButtons(); // Asegúrate de llamar la función para los botones de editar

                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }


    
    document.getElementById("create-folder-btn").addEventListener("click", function () {
        const folderName = prompt("Digite o nome da nova pasta:");
    
        if (folderName) {
            const currentPath = document.getElementById("current-path").dataset.currentPath || 'img/projetos';
    
            // Verifica si está creando dentro de una categoría (más de 2 niveles)
            const pathParts = currentPath.split("/");
            const isInsideCategory = pathParts.length > 2; 
    
            if (isInsideCategory) {
                // Pedir datos para el `info.json`
                const medidas = prompt("Digite as medidas:");
                const ano = prompt("Digite o ano:");
                const endereco = prompt("Digite o endereço:");
                const tipo = prompt("Digite o tipo:");
    
                if (!medidas || !ano || !endereco || !tipo) {
                    alert("⚠️ Todos os campos são obrigatórios.");
                    return;
                }
    
                // Enviar la solicitud a `/create_sub_folder_with_info`
                fetch("/create_sub_folder_with_info", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        path: currentPath,
                        folder_name: folderName,
                        medidas: medidas,
                        ano: ano,
                        endereco: endereco,
                        tipo: tipo
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("✅ Pasta criada com sucesso!");
                        loadFiles(currentPath);  // 🔥 Actualiza la lista
                    } else {
                        alert(`❌ Erro: ${data.error}`);
                    }
                })
                .catch(error => {
                    console.error("Erro ao criar pasta com info.json:", error);
                    alert("❌ Erro ao criar a pasta.");
                });
    
            } else {
                // Si no está dentro de una categoría, crea la carpeta normal
                fetch(`/create_folder?path=${encodeURIComponent(currentPath)}&name=${encodeURIComponent(folderName)}`, {
                    method: "POST"
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("✅ Pasta criada com sucesso!");
                        loadFiles(currentPath);
                    } else {
                        alert(`❌ Erro: ${data.error}`);
                    }
                })
                .catch(error => {
                    console.error("Erro ao criar a pasta:", error);
                    alert("❌ Erro ao criar a pasta.");
                });
            }
        }
    });
    



    // Actualizar la ruta de breadcrumbs
    function updateBreadcrumb(path) {
        const parts = path.split('/');
        let accumulatedPath = '';
        currentPath.innerHTML = '';

        parts.forEach((part, index) => {
            if (index === 0) {
                accumulatedPath = part;
            } else {
                accumulatedPath += '/' + part;
            }

            const breadcrumb = document.createElement('a');
            breadcrumb.href = '#';
            breadcrumb.dataset.path = accumulatedPath;
            breadcrumb.textContent = part;
            breadcrumb.addEventListener('click', function (e) {
                e.preventDefault();
                loadFiles(this.dataset.path);
            });

            currentPath.appendChild(breadcrumb);

            if (index < parts.length - 1) {
                const separator = document.createElement('span');
                separator.textContent = ' / ';
                currentPath.appendChild(separator);
            }
        });

        // Guardar o caminho atual no dataset
        currentPath.dataset.currentPath = path;
    }

    // Configurar navegación entre carpetas
    function setupFolderNavigation() {
        document.querySelectorAll('.folder-link').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const path = this.dataset.path;
                loadFiles(path); // Cargar contenido de la carpeta seleccionada
            });
        });
    }

    // Configurar botones de eliminación
    function setupDeleteButtons() {
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", function () {
                const path = this.dataset.path;
                const type = this.dataset.type;

                if (confirm(`¿Estás seguro de eliminar este ${type}?`)) {
                    fetch(`/delete_item?path=${encodeURIComponent(path)}`, { method: "POST" })
                        .then(response => {
                            if (response.ok) {
                                loadFiles(currentPath.dataset.currentPath);
                            } else {
                                alert("Error al eliminar el elemento.");
                            }
                        })
                        .catch(error => {
                            console.error("Error al eliminar el elemento:", error);
                            alert("Error al eliminar el elemento.");
                        });
                }
            });
        });
    }

    // Configurar botones de renombrar
    function setupRenameButtons() {
        document.querySelectorAll(".rename-btn").forEach(button => {
            button.addEventListener("click", function () {
                const path = this.dataset.path;
                const newName = prompt("Introduce el nuevo nombre:");
                if (newName) {
                    fetch(`/rename_item?path=${encodeURIComponent(path)}&new_name=${encodeURIComponent(newName)}`, {
                        method: "POST"
                    })
                        .then(response => {
                            if (response.ok) {
                                loadFiles(currentPath.dataset.currentPath);
                            } else {
                                alert("Error al renombrar el item.");
                            }
                        });
                }
            });
        });
    }

    // Configurar botones de edición de JSON
    function setupEditButtons() {
        document.querySelectorAll(".edit-json-btn").forEach(button => {
            button.addEventListener("click", async function () {
                const path = this.dataset.path;
    
                try {
                    const response = await fetch(`/edit_file?path=${encodeURIComponent(path)}`);
                    if (!response.ok) {
                        throw new Error("No se pudo cargar el archivo.");
                    }
                    const content = await response.text();
    
                    // Crear popup dinámico
                    const popup = document.createElement("div");
                    popup.className = "popup";
                    popup.innerHTML = `
                        <div class="popup-content">
                            <h3>Editar Archivo JSON</h3>
                            <textarea>${content}</textarea>
                            <button class="save-json-btn">Guardar</button>
                            <button class="close-popup-btn">Cerrar</button>
                        </div>
                    `;
                    document.body.appendChild(popup);
    
                    // Configurar eventos del popup
                    popup.querySelector(".close-popup-btn").addEventListener("click", () => {
                        popup.remove();
                    });
    
                    popup.querySelector(".save-json-btn").addEventListener("click", async () => {
                        const newContent = popup.querySelector("textarea").value;
                        const saveResponse = await fetch(`/edit_file?path=${encodeURIComponent(path)}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ content: newContent })
                        });
    
                        if (saveResponse.ok) {
                            alert("Archivo guardado con éxito.");
                            popup.remove();
                            loadFiles(currentPath.dataset.currentPath); // Recargar la lista
                        } else {
                            alert("Error al guardar el archivo.");
                        }
                    });
                } catch (error) {
                    console.error("Error al editar JSON:", error);
                    alert("No se pudo abrir el archivo para editar.");
                }
            });
        });
    }
    

    // Subir archivo
    document.getElementById("upload-file-btn").addEventListener("click", function () {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.addEventListener("change", function () {
            const files = input.files;
            const formData = new FormData();
            for (const file of files) {
                formData.append("files", file);
            }

            fetch(`/upload_files?path=${encodeURIComponent(currentPath.dataset.currentPath)}`, {
                method: "POST",
                body: formData,
            })
                .then(response => {
                    if (response.ok) {
                        loadFiles(currentPath.dataset.currentPath);
                    } else {
                        alert("Error al subir archivos.");
                    }
                });
        });
        input.click();
    });

    // Cargar la carpeta inicial
    loadFiles();
});

// Funcionalidad de búsqueda de blogs
const searchBar = document.getElementById('search-bar');
const blogContainer = document.getElementById('blog-container');

searchBar.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const blogs = blogContainer.querySelectorAll('.slider-item');

    blogs.forEach(blog => {
        const titulo = blog.querySelector('h3').textContent.toLowerCase();
        const autor = blog.querySelector('p').textContent.toLowerCase();

        if (titulo.includes(query) || autor.includes(query)) {
            blog.style.display = '';
        } else {
            blog.style.display = 'none';
        }
    });
});

// ===== Depoimentos CRUD (simple) =====
document.addEventListener('DOMContentLoaded', () => {
    const depoSection = document.getElementById('depoimentos-section');
    if (!depoSection) return;

    // Helper para leer JSON actual del backend y guardar
    async function loadDepoimentosJSON() {
        const res = await fetch('/get_json?path=/data/depoimentos.json');
        if (!res.ok) throw new Error('Erro ao carregar depoimentos.json');
        return res.json();
    }

    async function saveDepoimentosJSON(data) {
        const res = await fetch('/save_json?path=/data/depoimentos.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Erro ao salvar depoimentos.json');
    }

    // Upload de imagem para /static/img/depoimentos
    async function uploadDepoImage(file) {
        const formData = new FormData();
        formData.append('files', file);
        const res = await fetch('/upload_files?path=' + encodeURIComponent('img/depoimentos'), {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Erro ao subir imagem');
        const data = await res.json();
        // Usar o nome normalizado retornado pelo backend
        if (data.files && data.files.length > 0) {
            return 'img/depoimentos/' + data.files[0];
        }
        // Fallback para o nome original (não deveria acontecer)
        return 'img/depoimentos/' + file.name;
    }

    // Função para configurar previews de depoimentos
    function setupDepoimentosPreviews() {
        // Preview para novo depoimento
        const newDepoImage = document.getElementById('new-depo-image');
        if (newDepoImage) {
            // Criar elemento de preview se não existir
            let previewContainer = document.querySelector('.depo-new-preview');
            if (!previewContainer) {
                previewContainer = document.createElement('div');
                previewContainer.className = 'depo-new-preview';
                previewContainer.style.cssText = 'margin: 10px 0; text-align: center;';
                const previewImg = document.createElement('img');
                previewImg.style.cssText = 'max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #ddd;';
                previewImg.alt = 'Preview';
                previewContainer.appendChild(previewImg);
                newDepoImage.parentElement.parentElement.insertBefore(previewContainer, newDepoImage.parentElement.nextSibling);
            }
            
            // Remover listeners antigos e adicionar novo
            const newInput = newDepoImage.cloneNode(true);
            newDepoImage.parentNode.replaceChild(newInput, newDepoImage);
            
            newInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecione apenas imagens.');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    const previewImg = previewContainer.querySelector('img');
                    previewImg.src = event.target.result;
                    previewImg.style.border = '3px solid #4CAF50';
                    previewImg.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
                };
                reader.readAsDataURL(file);
            });
        }
        
        // Preview para depoimentos existentes (trocar imagem)
        const depoImageFiles = document.querySelectorAll('.depo-image-file');
        depoImageFiles.forEach(input => {
            // Remover listeners antigos
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            newInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecione apenas imagens.');
                    return;
                }
                
                // Encontrar a imagem de preview no mesmo row
                const row = newInput.closest('.depo-item');
                if (!row) return;
                
                const previewImg = row.querySelector('.depo-thumb img');
                if (!previewImg) return;
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    previewImg.src = event.target.result;
                    previewImg.style.border = '3px solid #4CAF50';
                    previewImg.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Função para extrair ano do título
    function extractYear(title) {
        // Extrai o ano do título no formato "Família Resende, Socorro/SP (2025)"
        const match = title.match(/\((\d{4})\)/);
        if (match) {
            return parseInt(match[1], 10);
        }
        // Se não encontrar ano, retorna 0 para colocar no final
        return 0;
    }

    // Função para verificar se os depoimentos já estão ordenados por ano
    function isAlreadySorted(data) {
        for (let i = 0; i < data.length - 1; i++) {
            const yearA = extractYear(data[i].title);
            const yearB = extractYear(data[i + 1].title);
            if (yearA < yearB) {
                return false; // Não está ordenado (deveria ser descendente)
            }
        }
        return true; // Já está ordenado
    }

    // Função para ordenar depoimentos por ano (mais recente primeiro)
    function sortDepoimentosByYear(data) {
        return [...data].sort((a, b) => {
            const yearA = extractYear(a.title);
            const yearB = extractYear(b.title);
            return yearB - yearA; // Descendente: mais recente primeiro
        });
    }

    // Renderizar tabela sem recarregar
    function renderDepoTable(data) {
        const tbody = document.getElementById('depo-list');
        if (!tbody) return;
        
        // Usar dados como estão se já estiverem ordenados
        const sortedData = isAlreadySorted(data) ? data : sortDepoimentosByYear(data);
        
        const rows = sortedData.map((d, i) => `
            <tr class="depo-item" data-index="${i}">
                <td>
                    <div class="depo-thumb">
                        <img src="/static/${d.image}" alt="${d.title}">
                    </div>
                    <label class="file-upload-btn small">Trocar
                        <input type="file" class="depo-image-file" data-current="${d.image}" style="display:none;" />
                    </label>
                    <div class="muted small">${d.image}</div>
                </td>
                <td>
                    <input type="text" value="${d.title.replace(/"/g, '&quot;')}" class="depo-title" />
                </td>
                <td>
                    <textarea class="depo-text" rows="2">${d.text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
                </td>
                <td class="depo-actions">
                    <button class="save-depo-btn">Salvar</button>
                    <button class="delete-depo-btn danger">Excluir</button>
                </td>
            </tr>
        `).join('');
        tbody.innerHTML = rows;
        
        // Reconfigurar previews após renderizar a tabela
        setupDepoimentosPreviews();
    }

    // Guardar cambios en items existentes
    depoSection.addEventListener('click', async (e) => {
        if (e.target.classList.contains('save-depo-btn')) {
            const item = e.target.closest('.depo-item');
            const title = item.querySelector('.depo-title').value.trim();
            const text = item.querySelector('.depo-text').value.trim();
            const fileInput = item.querySelector('.depo-image-file');
            let imagePath = fileInput.dataset.current;

            try {
                if (fileInput.files && fileInput.files[0]) {
                    imagePath = await uploadDepoImage(fileInput.files[0]);
                }
                const data = await loadDepoimentosJSON();
                const idx = parseInt(item.dataset.index, 10);
                if (idx >= 0) {
                    // Encontrar o item correto na lista
                    const sortedData = isAlreadySorted(data) ? data : sortDepoimentosByYear(data);
                    if (idx < sortedData.length) {
                        sortedData[idx] = { title, text, image: imagePath };
                    }
                    // Reordenar apenas se necessário e salvar
                    const reordered = isAlreadySorted(sortedData) ? sortedData : sortDepoimentosByYear(sortedData);
                    await saveDepoimentosJSON(reordered);
                    alert('Depoimento salvo');
                    renderDepoTable(reordered);
                }
            } catch (err) {
                alert('Erro ao salvar: ' + err.message);
            }
        }

        if (e.target.classList.contains('delete-depo-btn')) {
            if (!confirm('Excluir este depoimento?')) return;
            const item = e.target.closest('.depo-item');
            const idx = parseInt(item.dataset.index, 10);
            try {
                const data = await loadDepoimentosJSON();
                const sortedData = isAlreadySorted(data) ? data : sortDepoimentosByYear(data);
                sortedData.splice(idx, 1);
                await saveDepoimentosJSON(sortedData);
                alert('Depoimento excluído');
                renderDepoTable(sortedData);
            } catch (err) {
                alert('Erro ao excluir: ' + err.message);
            }
        }

    });

    // Adicionar novo depoimento
    const addBtn = document.getElementById('add-depo-btn');
    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            const title = document.getElementById('new-depo-title').value.trim();
            const text = document.getElementById('new-depo-text').value.trim();
            const file = document.getElementById('new-depo-image').files[0];
            if (!title || !text || !file) { alert('Preencha título, texto e imagem'); return; }
            try {
                const imagePath = await uploadDepoImage(file);
                const data = await loadDepoimentosJSON();
                data.push({ title, text, image: imagePath });
                // Ordenar apenas se necessário e salvar
                const sortedData = isAlreadySorted(data) ? data : sortDepoimentosByYear(data);
                await saveDepoimentosJSON(sortedData);
                alert('Depoimento adicionado');
                renderDepoTable(sortedData);
            } catch (err) {
                alert('Erro ao adicionar: ' + err.message);
            }
        });
    }

    // Inicial: tabela já vem renderizada do servidor
    // Ordenar automaticamente ao carregar apenas se necessário
    (async () => {
        try {
            const data = await loadDepoimentosJSON();
            if (!isAlreadySorted(data)) {
                // Só reorganiza e salva se não estiver ordenado
                const sortedData = sortDepoimentosByYear(data);
                await saveDepoimentosJSON(sortedData);
                renderDepoTable(sortedData);
            } else {
                // Já está ordenado, só renderiza
                renderDepoTable(data);
            }
        } catch (err) {
            console.error('Erro ao ordenar depoimentos:', err);
        }
    })();
    // Configurar previews de depoimentos na inicialização
    setupDepoimentosPreviews();

    // ============================================================
    // GERENCIAMENTO DE CAMPANHAS
    // ============================================================
    
    async function loadCampanhasJSON() {
        const res = await fetch('/get_campanhas');
        if (!res.ok) throw new Error('Erro ao carregar campanhas');
        return await res.json();
    }

    async function saveCampanhasJSON(data) {
        const res = await fetch('/save_campanhas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Erro ao salvar campanhas');
    }

    async function uploadCampanhaImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/upload_campanha_image', {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Erro ao subir imagem');
        const data = await res.json();
        return data.filename;
    }

    function renderCampanhasTable(campanhas) {
        const tbody = document.getElementById('campanhas-list');
        if (!tbody) return;
        
        const rows = campanhas.map((c, i) => `
            <tr class="campanha-item" data-index="${i}">
                <td>
                    <div class="depo-thumb">
                        <img src="/static/${c.image}" alt="${c.title}" style="max-width: 100px; border-radius: 4px;">
                    </div>
                </td>
                <td>
                    <input type="text" value="${c.title.replace(/"/g, '&quot;')}" class="campanha-title" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
                </td>
                <td>
                    <input type="url" value="${c.link.replace(/"/g, '&quot;')}" class="campanha-link" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
                </td>
                <td style="text-align: center;">
                    <label style="display: flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer;">
                        <input type="checkbox" class="campanha-active" ${c.active ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;" />
                        <span>${c.active ? 'Ativa' : 'Inativa'}</span>
                    </label>
                </td>
                <td class="depo-actions">
                    <button class="save-campanha-btn" style="background-color: #27ae60;">Salvar</button>
                    <button class="delete-campanha-btn danger">Excluir</button>
                </td>
            </tr>
        `).join('');
        tbody.innerHTML = rows;
    }

    // Preview para nova campanha
    const newCampanhaImage = document.getElementById('new-campanha-image');
    if (newCampanhaImage) {
        newCampanhaImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione apenas imagens.');
                return;
            }
            
            let previewContainer = document.querySelector('.campanha-new-preview');
            if (!previewContainer.querySelector('img')) {
                const previewImg = document.createElement('img');
                previewImg.style.cssText = 'max-width: 300px; max-height: 200px; border-radius: 8px; border: 2px solid #ddd;';
                previewImg.alt = 'Preview';
                previewContainer.appendChild(previewImg);
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const previewImg = previewContainer.querySelector('img');
                previewImg.src = event.target.result;
                previewImg.style.border = '3px solid #27ae60';
                previewImg.style.boxShadow = '0 0 10px rgba(39, 174, 96, 0.5)';
            };
            reader.readAsDataURL(file);
        });
    }

    // Adicionar nova campanha
    const addCampanhaBtn = document.getElementById('add-campanha-btn');
    if (addCampanhaBtn) {
        addCampanhaBtn.addEventListener('click', async () => {
            const title = document.getElementById('new-campanha-title').value.trim();
            const link = document.getElementById('new-campanha-link').value.trim();
            const file = document.getElementById('new-campanha-image').files[0];
            const active = document.getElementById('new-campanha-active').checked;
            
            if (!title || !link || !file) {
                alert('Preencha título, link e imagem');
                return;
            }
            
            try {
                const imagePath = await uploadCampanhaImage(file);
                const campanhas = await loadCampanhasJSON();
                campanhas.push({ title, link, image: imagePath, active });
                await saveCampanhasJSON(campanhas);
                alert('Campanha adicionada com sucesso!');
                
                // Limpar formulário
                document.getElementById('new-campanha-title').value = '';
                document.getElementById('new-campanha-link').value = '';
                document.getElementById('new-campanha-image').value = '';
                document.getElementById('new-campanha-active').checked = true;
                document.querySelector('.campanha-new-preview').innerHTML = '';
                
                renderCampanhasTable(campanhas);
            } catch (err) {
                alert('Erro ao adicionar campanha: ' + err.message);
            }
        });
    }

    // Event delegation para ações de campanhas
    const campanhasTable = document.querySelector('.campanhas-table-wrapper');
    if (campanhasTable) {
        campanhasTable.addEventListener('click', async (e) => {
            if (e.target.classList.contains('save-campanha-btn')) {
                const item = e.target.closest('.campanha-item');
                const idx = parseInt(item.dataset.index, 10);
                const title = item.querySelector('.campanha-title').value.trim();
                const link = item.querySelector('.campanha-link').value.trim();
                const active = item.querySelector('.campanha-active').checked;
                
                try {
                    const campanhas = await loadCampanhasJSON();
                    if (idx >= 0 && idx < campanhas.length) {
                        campanhas[idx].title = title;
                        campanhas[idx].link = link;
                        campanhas[idx].active = active;
                        await saveCampanhasJSON(campanhas);
                        alert('Campanha salva com sucesso!');
                        renderCampanhasTable(campanhas);
                    }
                } catch (err) {
                    alert('Erro ao salvar campanha: ' + err.message);
                }
            }
            
            if (e.target.classList.contains('delete-campanha-btn')) {
                if (!confirm('Excluir esta campanha?')) return;
                const item = e.target.closest('.campanha-item');
                const idx = parseInt(item.dataset.index, 10);
                
                try {
                    const campanhas = await loadCampanhasJSON();
                    campanhas.splice(idx, 1);
                    await saveCampanhasJSON(campanhas);
                    alert('Campanha excluída com sucesso!');
                    renderCampanhasTable(campanhas);
                } catch (err) {
                    alert('Erro ao excluir campanha: ' + err.message);
                }
            }
        });
        
        // Atualizar label de status ao mudar checkbox
        campanhasTable.addEventListener('change', (e) => {
            if (e.target.classList.contains('campanha-active')) {
                const label = e.target.parentElement.querySelector('span');
                label.textContent = e.target.checked ? 'Ativa' : 'Inativa';
            }
        });
    }

    // Carregar campanhas ao iniciar
    (async () => {
        try {
            const campanhas = await loadCampanhasJSON();
            renderCampanhasTable(campanhas);
        } catch (err) {
            console.error('Erro ao carregar campanhas:', err);
        }
    })();
});

// ============================================================
// PREVIEW DE IMAGENS AO SELECIONAR ARQUIVO (Sliders e Headers)
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
    // Função para mostrar preview da imagem selecionada
    function setupImagePreviews() {
        // Selecionar todos os inputs de arquivo em seções de sliders e headers
        const fileInputs = document.querySelectorAll(
            '#slider-section input[type="file"], ' +
            '#slider-section_mobile input[type="file"], ' +
            '#header-desktop-section input[type="file"], ' +
            '#header-mobile-section input[type="file"], ' +
            '#quem-somos-section input[type="file"], ' +
            '#sobre-nos-section input[type="file"]'
        );

        fileInputs.forEach(input => {
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;

                // Verificar se é uma imagem
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecione apenas imagens.');
                    return;
                }

                // Encontrar a imagem de preview mais próxima
                const container = input.closest('.slider-item, .section-item');
                if (!container) return;

                const previewImg = container.querySelector('img.slider-preview, img.section-preview');
                if (!previewImg) return;

                // Criar URL temporária e atualizar a preview
                const reader = new FileReader();
                reader.onload = function(event) {
                    previewImg.src = event.target.result;
                    // Adicionar um indicador visual de que foi alterado
                    previewImg.style.border = '3px solid #4CAF50';
                    previewImg.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Configurar previews ao carregar a página
    setupImagePreviews();

    // Reconfigurar previews quando mudar de seção (para casos dinâmicos)
    const sections = document.querySelectorAll("section");
    const observer = new MutationObserver(() => {
        setupImagePreviews();
    });

    sections.forEach(section => {
        observer.observe(section, { childList: true, subtree: true });
    });
});