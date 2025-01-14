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
                    data.files.forEach(file => {
                        let icon = 'fa-file'; // Icono por defecto para archivo
                        const fileExtension = file.name.split('.').pop().toLowerCase();

                        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                            icon = 'fa-file-image'; // Cambia a icono de imagen si es imagen
                        }

                        const li = document.createElement('li');
                        li.innerHTML = `
                            <span class="file-icon"><i class="fas ${icon}"></i></span> 
                            <span>${file.name}</span>
                            <button class="delete-btn" data-path="${file.path}" data-type="file"><i class="fas fa-trash"></i></button>
                            <button class="rename-btn" data-path="${file.path}" data-type="file"><i class="fas fa-edit"></i></button>
                        `;
                        fileList.appendChild(li);
                    });

                    // Agregar eventos
                    setupDeleteButtons();
                    setupRenameButtons();
                    setupFolderNavigation();
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    // Actualizar la ruta de breadcrumbs
    function updateBreadcrumb(path) {
        const parts = path.split('/');
        let accumulatedPath = '';
        currentPath.innerHTML = '';

        parts.forEach((part, index) => {
            // Monta o path passo a passo
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
                                // Após deletar, recarrega a lista
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
                            // Após renomear, recarrega a lista
                            loadFiles(currentPath.dataset.currentPath);
                        } else {
                            alert("Error al renombrar el item.");
                        }
                    });
                }
            });
        });
    }

    document.getElementById("create-folder-btn").addEventListener("click", async function () {
        const folderName = prompt("Introduce el nombre de la nueva carpeta:");
        if (!folderName) return;
    
        const current = currentPath.dataset.currentPath; 
        // Ex.: "img/projetos", "img/projetos/categoriaX", etc.
    
        // Conta quantos níveis há DEPOIS de "img/projetos"
        let subLevel = current.replace("img/projetos", "").split("/").filter(Boolean).length;
    
        if (subLevel >= 1) {
            // Já estamos dentro de "img/projetos/alguma_coisa"
            // Precisamos apenas pedir informações obrigatórias e criar o info.json
    
            const medidas  = prompt("Medidas (ex: 120 m²):");
            if (!medidas) return;
            const ano      = prompt("Ano (ex: 2022):");
            if (!ano) return;
            const endereco = prompt("Endereço (ex: Socorro, SP):");
            if (!endereco) return;
            const tipo     = prompt("Tipo (ex: Residencial):");
            if (!tipo) return;
    
            try {
                // Montar FormData para enviar via POST
                const formData = new FormData();
                formData.append("path", current);         // "img/projetos/categoriaX"
                formData.append("folder_name", folderName);
                formData.append("medidas", medidas);
                formData.append("ano", ano);
                formData.append("endereco", endereco);
                formData.append("tipo", tipo);
    
                const resp = await fetch("/create_sub_folder_with_info", {
                    method: "POST",
                    body: formData
                });
    
                const data = await resp.json();
                if (resp.ok && data.success) {
                    // Atualizar listagem
                    loadFiles(currentPath.dataset.currentPath);
                } else {
                    alert("Error: " + (data.error || "Desconocido"));
                }
            } catch (err) {
                alert("Error al crear la carpeta: " + err);
            }
    
        } else {
            // Ainda estamos em "img/projetos" ou fora => cria pasta normal
            fetch(`/create_folder?path=${encodeURIComponent(current)}&name=${encodeURIComponent(folderName)}`, {
                method: "POST"
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    loadFiles(currentPath.dataset.currentPath);
                } else {
                    alert("Error al crear la carpeta: " + (data.error || "Desconocido"));
                }
            })
            .catch(e => alert(e));
        }
    });
    
    
    
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

            // Também use dataset no path
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
