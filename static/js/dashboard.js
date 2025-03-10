document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const menuLinks = document.querySelectorAll(".menu a");
    const sections = document.querySelectorAll("section");

    // Alternar el menú hamburguesa
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });

    // Cambiar entre secciones en el menú
    menuLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            // Remover la clase 'active' de todos los enlaces del menú
            menuLinks.forEach(link => link.classList.remove("active"));

            // Agregar la clase 'active' al enlace clicado
            this.classList.add("active");

            // Ocultar todas las secciones
            sections.forEach(section => section.classList.add("hidden-section"));
            sections.forEach(section => section.classList.remove("active-section"));

            // Mostrar la sección correspondiente
            const targetSection = document.getElementById(this.getAttribute("data-section"));
            if (targetSection) {
                targetSection.classList.remove("hidden-section");
                targetSection.classList.add("active-section");
            }

            // Cerrar el menú en dispositivos pequeños
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("active");
            }
        });
    });

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