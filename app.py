from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
import os, json, datetime, shutil,uuid
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename

app = Flask(__name__)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'jose.villamediana.osorio@gmail.com'  # Tu email
app.config['MAIL_PASSWORD'] = 'yhsl apqh sics zddu'  # Código de aplicación de Gmail
app.config['MAIL_DEFAULT_SENDER'] = ('Jose Villamediana', 'jose.villamediana.osorio@gmail.com')
app.config['MAIL_MAX_EMAILS'] = None
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100 MB
app.secret_key = '3HpAUadGVgxO' 
#app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 31536000  # 365 días


mail = Mail(app)

def formatar_data(fecha_str):
    # Convertir la cadena a un objeto de fecha
    fecha = datetime.strptime(fecha_str, "%Y-%m-%d")
    
    # Transformar la fecha al formato deseado
    fecha_formateada = fecha.strftime("%a, %d de %B de %Y")

    # Ajustar los nombres de los días y meses al portugués
    dias_semana = {
        "Mon": "Seg",
        "Tue": "Ter",
        "Wed": "Qua",
        "Thu": "Qui",
        "Fri": "Sex",
        "Sat": "Sáb",
        "Sun": "Dom"
    }

    meses = {
        "January": "janeiro",
        "February": "fevereiro",
        "March": "março",
        "April": "abril",
        "May": "maio",
        "June": "junho",
        "July": "julho",
        "August": "agosto",
        "September": "setembro",
        "October": "outubro",
        "November": "novembro",
        "December": "dezembro"
    }

    # Reemplazar en la fecha formateada
    dia_semana, resto_fecha = fecha_formateada.split(",", 1)
    dia_semana_pt = dias_semana.get(dia_semana, dia_semana)
    for en, pt in meses.items():
        resto_fecha = resto_fecha.replace(en, pt)

    return f"{resto_fecha.strip()}"



# Ruta para la página de inicio
@app.route('/')
def index():
    # Ruta al archivo JSON
    json_path = os.path.join(app.static_folder, 'data', 'data.json')

    # Cargar los datos del JSON
    try:
        with open(json_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
    except Exception as e:
        print(f"Error al cargar el JSON: {e}")
        data = {}

    # Obtener las imágenes del slider y el contenido de la segunda sección
    slider_images = data.get('slider_images', [])
    second_section = data.get('second_section', {})

    # Obtener los ítems del submenú dinámicamente (categorías)
    projetos_path = os.path.join(app.static_folder, 'img', 'projetos')
    submenu_items = []
    if os.path.exists(projetos_path):
        submenu_items = [name for name in os.listdir(projetos_path) if os.path.isdir(os.path.join(projetos_path, name))]
        submenu_items.sort()  # Opcional: ordenar alfabéticamente

    return render_template('index.html', slider_images=slider_images, second_section=second_section, submenu_items=submenu_items)


@app.route('/login', methods=['GET', 'POST'])
def login():
    # Define a senha “fixa” no código
    SENHA_CORRETA = "costa@m4t0s0"

    if request.method == 'POST':
        password_digitada = request.form.get('password')
        if password_digitada == SENHA_CORRETA:
            # Marca na sessão que está autorizado
            session['authorized'] = True
            return redirect(url_for('dashboard'))
        else:
            flash("Senha incorreta.")
            return render_template('login.html')
    else:
        # Se método GET, só exibe o form
        return render_template('login.html')


# Ruta para cada categoría
from datetime import datetime
@app.route('/categoria/<nome_categoria>')
def categoria(nome_categoria):
    # Ruta a la categoría
    categoria_path = os.path.join(app.static_folder, 'img', 'projetos', nome_categoria)
    if not os.path.exists(categoria_path) or not os.path.isdir(categoria_path):
        return "Categoria não encontrada", 404

    # Obtener los proyectos dentro de la categoría
    projetos = []
    for projeto_name in os.listdir(categoria_path):
        projeto_path = os.path.join(categoria_path, projeto_name)
        if os.path.isdir(projeto_path):
            # Ruta a la imagen de capa
            capa_path = os.path.join(projeto_path, 'capa.jpg')
            if os.path.exists(capa_path):
                relative_path = f'img/projetos/{nome_categoria}/{projeto_name}/capa.jpg'
                capa_url = url_for('static', filename=relative_path)
            else:
                capa_url = url_for('static', filename='img/default_capa.jpg')  # Imagen por defecto si no hay capa

            # Leer el archivo info.json
            info_json_path = os.path.join(projeto_path, 'info.json')
            if os.path.exists(info_json_path):
                with open(info_json_path, 'r', encoding='utf-8') as f:
                    info = json.load(f)
                medidas = info.get('medidas', 'N/A')
            else:
                medidas = 'N/A'

            # Obtener la fecha de última modificación del directorio del proyecto
            mod_time = os.path.getmtime(projeto_path)  # Fecha de modificación
            mod_time_str = datetime.fromtimestamp(mod_time).strftime('%Y-%m-%d %H:%M:%S')

            projetos.append({
                'nome': projeto_name,
                'capa_url': capa_url,
                'medidas': medidas,
                'mod_time': mod_time_str  # Guardar la fecha de modificación
            })

    # Ordenar los proyectos por fecha de modificación en orden descendente
    projetos.sort(key=lambda x: x['mod_time'], reverse=True)

    # Obtener los ítems del submenú nuevamente para pasarlos a la plantilla
    projetos_path = os.path.join(app.static_folder, 'img', 'projetos')
    submenu_items = []
    if os.path.exists(projetos_path):
        submenu_items = [name for name in os.listdir(projetos_path) if os.path.isdir(os.path.join(projetos_path, name))]
        submenu_items.sort()

    return render_template('projeto.html', nome_categoria=nome_categoria, projetos=projetos, submenu_items=submenu_items)

import random

# Ruta para ver detalles de un proyecto específico
@app.route('/categoria/<nome_categoria>/<nome_projeto>')
def detalhe_projeto(nome_categoria, nome_projeto):
    # Ruta al proyecto específico
    projeto_path = os.path.join(app.static_folder, 'img', 'projetos', nome_categoria, nome_projeto)
    if not os.path.exists(projeto_path) or not os.path.isdir(projeto_path):
        return "Projeto não encontrado", 404

    # Leer el archivo info.json
    info_json_path = os.path.join(projeto_path, 'info.json')
    if os.path.exists(info_json_path):
        with open(info_json_path, 'r', encoding='utf-8') as f:
            info = json.load(f)
        medidas = info.get('medidas', 'N/A')
        tipo = info.get('tipo', 'N/A')
        ano = info.get('ano', 'N/A')
        endereco = info.get('endereco', 'N/A')
    else:
        medidas = 'N/A'
        ano = 'N/A'
        endereco = 'N/A'
        tipo = 'N/A'

    # Obtener todas las imágenes del proyecto y asignar clases aleatorias
    imagens = []
    clases = ['wide', 'tall', 'medium', '']  # Clases posibles para el layout

    for file_name in os.listdir(projeto_path):
        if file_name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.mp4')) and file_name != 'capa.jpg':
            # Construir la ruta relativa usando forward slashes
            relative_path = f'img/projetos/{nome_categoria}/{nome_projeto}/{file_name}'
            file_url = url_for('static', filename=relative_path)

            # Diferenciar imágenes y videos
            if file_name.lower().endswith(('.mp4')):
                # Añadir un archivo de video
                imagens.append({'url': file_url, 'tipo': 'video'})
            else:
                # Añadir un archivo de imagen con clase aleatoria
                clase_aleatoria = random.choice(clases)
                imagens.append({'url': file_url, 'tipo': 'imagen', 'clase': clase_aleatoria})


    # Contar el número total de fotos
    total_fotos = len(imagens)

    # Obtener las carpetas de proyectos dentro de la categoría actual, excluyendo el proyecto actual
    categoria_path = os.path.join(app.static_folder, 'img', 'projetos', nome_categoria)
    proyectos_relacionados = []
        # Dentro de detalhe_projeto()
    if os.path.exists(categoria_path):
        proyectos_en_categoria = [
            p for p in os.listdir(categoria_path)
            if os.path.isdir(os.path.join(categoria_path, p))
        ]
        proyectos_en_categoria.sort()  # Orden alfabético, si así lo deseas

        try:
            idx_actual = proyectos_en_categoria.index(nome_projeto)
            
            # Rango para mostrar (del -5 al +5 sin incluir actual)
            # Por ejemplo, si idx_actual = 10, queremos [5..9] y [11..15]
            start_index = max(0, idx_actual - 5)  # no menos de 0
            end_index = min(len(proyectos_en_categoria), idx_actual + 6)  # +6 porque el slice es [start, end)
            
            # Tomamos una sublista de proyectos_en_categoria
            relacionados = proyectos_en_categoria[start_index:idx_actual] + proyectos_en_categoria[idx_actual+1:end_index]
            
            # Esto podría tener hasta 10 proyectos (5 atrás y 5 adelante), 
            # pero puede que no haya tantos si estás muy al inicio o muy al final.
            # Ahora construimos la lista 'projetos_relacionados' con la misma lógica de 'capa'.
            for nome_relacionado in relacionados:
                capa_relacionada = f'img/projetos/{nome_categoria}/{nome_relacionado}/capa.jpg'
                proyectos_relacionados.append({
                    'nome': nome_relacionado,
                    'capa': capa_relacionada
                })

        except ValueError:
            # El proyecto actual no está en la lista
            pass


    # Obtener los ítems del submenú nuevamente para pasarlos a la plantilla
    projetos_path = os.path.join(app.static_folder, 'img', 'projetos')
    submenu_items = []
    if os.path.exists(projetos_path):
        submenu_items = [name for name in os.listdir(projetos_path) if os.path.isdir(os.path.join(projetos_path, name))]
        submenu_items.sort()

    return render_template(
        'detalle_projeto.html',
        nome_categoria=nome_categoria,
        nome_projeto=nome_projeto,
        imagens=imagens,
        medidas=medidas,
        tipo=tipo,
        ano=ano,
        endereco=endereco,
        total_fotos=total_fotos,
        projetos_relacionados=proyectos_relacionados,
          submenu_items=submenu_items  # Proyectos relacionados pasados a la plantilla
    )


@app.route('/contato', methods=['GET', 'POST'])
def contato():
    json_path = os.path.join(app.static_folder, 'data', 'data.json')

    # Cargar los datos del JSON
    try:
        with open(json_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
    except Exception as e:
        print(f"Error al cargar el JSON: {e}")
        data = {}

    # Obtener las imágenes del slider y el contenido de la segunda sección
    contato_image = data['contato_image']

    # Obtener los ítems del submenú dinámicamente (categorías)
    projetos_path = os.path.join(app.static_folder, 'img', 'projetos')
    submenu_items = []
    if os.path.exists(projetos_path):
        submenu_items = [name for name in os.listdir(projetos_path) if os.path.isdir(os.path.join(projetos_path, name))]
        submenu_items.sort()  # Opcional: ordenar alfabéticamente

    if request.method == 'POST':
        # Obtener los datos del formulario
        nome = request.form.get('nome')
        telefone = request.form.get('telefone')
        email = request.form.get('email')
        proyecto = request.form.get('proyecto')

        # Crear el mensaje de correo
        #msg = Message('Novo contato de {}'.format(nome), recipients=['miguel.villamediana@outlook.com'])  # El destinatario del correo
        #msg.body = f"""
        #Novo contato recebido:
        #Nome: {nome}
        #Telefone: {telefone}
        #E-mail: {email}
        #Projeto: {proyecto}
        #"""

        # Enviar el correo
        #try:
        #    mail.send(msg)
        #    return redirect(url_for('contato'))  # Redirigir de vuelta a la página de contacto
        #except Exception as e:
        #    print(f'Ocorreu um erro ao enviar o e-mail: {str(e)}')
        #    return redirect(url_for('contato'))  # Redirigir de vuelta a la página de contacto incluso si hay un error

        # Nueva lógica para guardar en un archivo JSON
        submissions_file = os.path.join(app.static_folder, 'data', 'contact_submissions.json')

        # Intentar cargar las solicitudes existentes, o crear una lista vacía si el archivo no existe
        try:
            with open(submissions_file, 'r', encoding='utf-8') as f:
                submissions = json.load(f)
        except Exception as e:
            print(f"Error al cargar las solicitudes: {e}")
            submissions = []

        # Crear un nuevo registro de contacto con la fecha actual
        new_entry = {
            "nome": nome,
            "telefone": telefone,
            "email": email,
            "proyecto": proyecto,
            "fecha": datetime.datetime.now().isoformat()
        }

        # Agregar la nueva solicitud a la lista
        submissions.append(new_entry)

        # Guardar la lista actualizada en el archivo JSON
        try:
            # Asegurarse de que la carpeta existe
            submissions_folder = os.path.dirname(submissions_file)
            os.makedirs(submissions_folder, exist_ok=True)
            with open(submissions_file, 'w', encoding='utf-8') as f:
                json.dump(submissions, f, ensure_ascii=False, indent=4)
            print("Solicitud de contacto guardada con éxito.")
        except Exception as e:
            print(f"Error al guardar la solicitud: {e}")

    return render_template('contato.html', contato_image=contato_image, submenu_items=submenu_items)

@app.route('/blog')
def blog():
    # Ruta donde están los blogs
    blog_path = os.path.join(app.static_folder, 'img', 'blog')

    # Lista de artículos de blog
    articulos = []

    # Verificar que la ruta existe
    if os.path.exists(blog_path):
        # Iterar sobre las carpetas (cada carpeta es un artículo)
        for articulo in os.listdir(blog_path):
            articulo_dir = os.path.join(blog_path, articulo)

            # Verificar si es un directorio
            if os.path.isdir(articulo_dir):
                # Ruta al archivo json
                json_path = os.path.join(articulo_dir, 'blog-articulo.json')

                if os.path.exists(json_path):
                    # Leer el archivo JSON
                    with open(json_path, 'r', encoding='utf-8') as json_file:
                        data = json.load(json_file)
                        # Agregar el artículo a la lista
                        articulos.append({
                            'nombre': articulo,
                            'titulo': data.get('titulo', 'Título no disponible'),
                            'descricao': data.get('descricao', 'Descrição não disponível'),
                            'capa': f'img/blog/{articulo}/{data.get("capa", "capa.jpg")}'
                        })
    
    # Obtener los ítems del submenú dinámicamente (categorías)
    submenu_items = get_submenu_items()

    return render_template('blog.html', articulos=articulos, submenu_items=submenu_items)


@app.route('/blog/<nombre_articulo>')
def detalle_blog(nombre_articulo):
    # Ruta donde se almacenan los blogs
    blog_path = os.path.join(app.static_folder, 'img', 'blog', nombre_articulo)

    # Cargar el archivo JSON del blog
    blog_json_path = os.path.join(blog_path, 'blog-articulo.json')
    if os.path.exists(blog_json_path):
        with open(blog_json_path, 'r', encoding='utf-8') as f:
            articulo = json.load(f)
    else:
        return "Artículo no encontrado", 404

    # Procesar el contenido para calcular el tiempo de lectura
    texto = ""
    for item in articulo.get('contenido', []):
        if item.get('tipo') == 'parrafo':  # Solo cuenta las palabras de los párrafos
            texto += item.get('texto', "") + " "
    
    palabras = texto.split()  # Dividir en palabras
    tiempo_lectura = max(1, len(palabras) // 200)  # Calcular tiempo de lectura a razón de 200 palabras por minuto

    # Obtener el nombre de la carpeta de imágenes (si está en el JSON o usar el nombre del artículo por defecto)
    imagen_folder = articulo.get('imagen_folder', nombre_articulo)
    
    # Formatear la fecha
    data = formatar_data(articulo.get('data'))

    # Obtener los ítems del submenú dinámicamente (categorías)
    submenu_items = get_submenu_items()

    # Pasar los datos a la plantilla
    return render_template('detalle_blog.html', 
                           articulo=articulo, 
                           imagen_folder=imagen_folder, 
                           tiempo_lectura=tiempo_lectura,
                           data=data,
                           submenu_items=submenu_items)



def get_submenu_items():
    projetos_path = os.path.join(app.static_folder, 'img', 'projetos')
    submenu_items = []
    if os.path.exists(projetos_path):
        submenu_items = [name for name in os.listdir(projetos_path) if os.path.isdir(os.path.join(projetos_path, name))]
        submenu_items.sort()  # Opcional: ordenar alfabéticamente
    return submenu_items

@app.route('/create_blog')
def create_blog():
    return render_template('create_blog.html')  # Archivo de la página de creación de blogs

#---------------------------------------------------------------------------
#---------------------------------------------------------------------------
#---------------------------------------------------------------------------
#---------------------------------------------------------------------------
#---------------------------------------------------------------------------
#---------------------------------------------------------------------------

@app.route('/upload_image', methods=['POST'])
def upload_image():
    try:
        # Obtener el nombre de la carpeta del blog desde el formulario
        blog_folder = request.form.get('blog_folder')
        if not blog_folder:
            return jsonify({"error": "El nombre de la carpeta del blog no fue proporcionado"}), 400

        # Asegurar que el nombre sea seguro
        folder_name = secure_filename(blog_folder)
        blog_path = os.path.join(app.static_folder, 'img', 'blog', folder_name)

        # Crear la carpeta si no existe
        os.makedirs(blog_path, exist_ok=True)

        # Procesar la imagen
        image = request.files.get('image')
        if not image:
            return jsonify({"error": "No se envió ninguna imagen"}), 400

        # Validar el archivo de imagen
        allowed_extensions = {'.png', '.jpg', '.jpeg', '.gif'}
        extension = os.path.splitext(image.filename)[1].lower()
        if extension not in allowed_extensions:
            return jsonify({"error": "Formato de imagen no permitido"}), 400

        # Guardar la imagen con un nombre único
        image_filename = f"{uuid.uuid4().hex}{extension}"
        image_path = os.path.join(blog_path, image_filename)
        image.save(image_path)

        # Retornar la ruta relativa de la imagen
        relative_path = f"/static/img/blog/{folder_name}/{image_filename}"
        return jsonify({"url": relative_path}), 200

    except Exception as e:
        print(f"Error al subir la imagen: {e}")
        return jsonify({"error": str(e)}), 500



@app.route('/creation_blog', methods=['POST'])
def creation_blog():
    try:
        # Obtener los datos del formulario
        titulo = request.form.get('titulo')
        autor = request.form.get('autor')
        fecha = request.form.get('fecha')
        contenido_html = request.form.get('contenido')
        capa = request.files.get('imagen')

        # Validar campos obligatorios
        folder_name = secure_filename(titulo.replace(" ", "_").lower())
        blog_path = os.path.join(app.static_folder, 'img', 'blog', folder_name)
        json_path = os.path.join(blog_path, "blog-articulo.json")
        blog_exists = os.path.exists(json_path)

        if not (titulo and autor and fecha and contenido_html):
            return jsonify({"error": "Faltan datos obligatorios"}), 400

        if not blog_exists and not capa:
            return jsonify({"error": "La imagen de capa es obligatoria para un nuevo blog"}), 400

        # Crear carpeta única para el blog
        os.makedirs(blog_path, exist_ok=True)

        # Guardar la imagen de capa si se proporciona
        capa_filename = "capa.jpg"
        if capa:
            capa.save(os.path.join(blog_path, capa_filename))
        elif blog_exists:  # Si no hay nueva imagen, usar la existente
            with open(json_path, 'r', encoding='utf-8') as json_file:
                existing_blog = json.load(json_file)
                capa_filename = existing_blog.get("capa", capa_filename)

        # Procesar contenido del blog (Quill)
        contenido_lista = []
        parrafos = contenido_html.split("<p>")
        for parrafo in parrafos:
            parrafo = parrafo.replace("</p>", "").strip()
            if '<img src="' in parrafo:  # Detectar imágenes
                src_start = parrafo.index('<img src="') + len('<img src="')
                src_end = parrafo.index('"', src_start)
                img_path = parrafo[src_start:src_end]
                img_filename = os.path.basename(img_path)

                contenido_lista.append({"tipo": "imagen", "valor": img_filename})
            elif parrafo == "<br>":  # Líneas en blanco representadas como <br>
                contenido_lista.append({"tipo": "parrafo", "valor": ""})
            elif parrafo:
                contenido_lista.append({"tipo": "parrafo", "valor": parrafo})

        # Crear el JSON del blog
        blog_data = {
            "titulo": titulo,
            "autor": autor,
            "descripcion": contenido_lista[0]["valor"] if contenido_lista else "",
            "data": fecha,
            "capa": capa_filename,
            "contenido": contenido_lista,
            "imagen_folder": folder_name,
        }

        # Guardar el JSON
        with open(json_path, 'w', encoding='utf-8') as json_file:
            json.dump(blog_data, json_file, ensure_ascii=False, indent=4)

        return redirect(url_for('dashboard', status='success', message='Blog criado com sucesso!'))

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/delete_blog/<folder_name>', methods=['POST'])
def delete_blog(folder_name):
    try:
        # Ruta de la carpeta del blog
        blog_path = os.path.join(app.static_folder, 'img', 'blog', folder_name)

        # Validar si la carpeta existe
        if not os.path.exists(blog_path):
            return redirect(url_for('dashboard', status='error', message=f'El blog "{folder_name}" no existe.'))

        # Eliminar la carpeta y todos sus archivos
        import shutil
        shutil.rmtree(blog_path)

        return redirect(url_for('dashboard', status='success', message=f'Blog "{folder_name}" eliminado con éxito.'))
    except Exception as e:
        print(f"Error al eliminar el blog: {e}")
        return redirect(url_for('dashboard', status='error', message='Error al eliminar el blog.'))



@app.route('/edit_blog/<string:folder_name>', methods=['GET'])
def edit_blog(folder_name):
    try:
        # Ruta al archivo JSON del blog
        blog_path = os.path.join(app.static_folder, 'img', 'blog', folder_name, 'blog-articulo.json')

        if not os.path.exists(blog_path):
            return "Blog no encontrado", 404

        # Leer los datos del JSON
        with open(blog_path, 'r', encoding='utf-8') as json_file:
            blog_data = json.load(json_file)

        # Construir el contenido de Quill (reconvertir los párrafos e imágenes a HTML)
        contenido_html = ""
        for item in blog_data["contenido"]:
            if item["tipo"] == "parrafo":
                contenido_html += f"<p>{item['valor']}</p>"
            elif item["tipo"] == "imagen":
                contenido_html += f'<img src="/static/img/blog/{folder_name}/{item["valor"]}" alt="Imagen del blog">'

        blog_data["contenido_html"] = contenido_html

        return render_template('create_blog.html', blog=blog_data, folder_name=folder_name)
    except Exception as e:
        print(f"Error: {e}")
        return "Error al cargar el blog", 500


#---------------------------------------------------------------------------
#---------------------------------------------------------------------------
#---------------------------------------------------------------------------
#---------------------------------------------------------------------------
#---------------------------------------------------------------------------
#---------------------------------------------------------------------------


@app.route('/depoimentos')
def depoimentos():
    json_path = os.path.join(app.static_folder, 'data', 'data.json')

    # Cargar los datos del JSON
    try:
        with open(json_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
    except Exception as e:
        print(f"Error al cargar el JSON: {e}")
        data = {}

    # Obtener las secciones del JSON
    second_section = data.get('second_section', {})
    third_section = data.get('third_section', {})

    # Obtener los ítems del submenú dinámicamente (categorías)
    projetos_path = os.path.join(app.static_folder, 'img', 'projetos')
    submenu_items = []
    if os.path.exists(projetos_path):
        submenu_items = [name for name in os.listdir(projetos_path) if os.path.isdir(os.path.join(projetos_path, name))]
        submenu_items.sort()  # Opcional: ordenar alfabéticamente

    return render_template('depoimentos.html', second_section=second_section, third_section=third_section, submenu_items=submenu_items)

@app.route('/nos')
def nos():
    json_path = os.path.join(app.static_folder, 'data', 'data.json')

    # Cargar los datos del JSON
    try:
        with open(json_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
    except Exception as e:
        print(f"Error al cargar el JSON: {e}")
        data = {}

    # Obtener las secciones del JSON
    second_section = data.get('second_section', {})
    third_section = data.get('third_section', {})

    # Obtener los ítems del submenú dinámicamente (categorías)
    projetos_path = os.path.join(app.static_folder, 'img', 'projetos')
    submenu_items = []
    if os.path.exists(projetos_path):
        submenu_items = [name for name in os.listdir(projetos_path) if os.path.isdir(os.path.join(projetos_path, name))]
        submenu_items.sort()  # Opcional: ordenar alfabéticamente

    return render_template('nos.html', second_section=second_section, third_section=third_section, submenu_items=submenu_items)


@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():

    if not session.get('authorized'):
        return redirect(url_for('login'))
    
    json_path = os.path.join(app.static_folder, 'data', 'data.json')

    # Cargar los datos actuales del JSON
    try:
        with open(json_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
    except Exception as e:
        print(f"Error al cargar el JSON: {e}")
        data = {}

    if request.method == 'POST':
        # Actualizar imágenes del slider
        for i in range(5):
            image_file = request.files.get(f'slider_image_{i}')
            if image_file:
                filename = f'slider_{i}.jpg'  # Guardar con un nombre específico
                image_file.save(os.path.join(app.static_folder, 'img', filename))
                data['slider_images'][i] = f'img/{filename}'

        # Actualizar secciones (Second Section)
        second_section_title = request.form.get('second_section_title')
        second_section_text = request.form.get('second_section_text')

        # Solo actualizar si se proporciona nuevo contenido
        if second_section_title:
            data['second_section']['title'] = second_section_title
        if second_section_text:
            data['second_section']['text'] = second_section_text

        second_section_image = request.files.get('second_section_image')
        if second_section_image:
            second_section_image.save(os.path.join(app.static_folder, 'img', 'time.jpg'))
            data['second_section']['image'] = 'img/time.jpg'

        # Actualizar secciones (Third Section)
        third_section_text = request.form.get('third_section_text')

        if third_section_text:
            data['third_section']['text'] = third_section_text

        third_section_image = request.files.get('third_section_image')
        if third_section_image:
            third_section_image.save(os.path.join(app.static_folder, 'img', 'time2.jpg'))
            data['third_section']['image'] = 'img/time2.jpg'

        # Guardar los cambios en el archivo JSON
        with open(json_path, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, ensure_ascii=False, indent=4)

        return redirect(url_for('dashboard'))

    # Enumerar las imágenes para pasarlas a la plantilla
    enumerated_slider_images = list(enumerate(data.get('slider_images', [])))

    # Agregar la funcionalidad para cargar los blogs
    blogs_path = os.path.join(app.static_folder, 'img', 'blog')
    blogs = []
    if os.path.exists(blogs_path):
        for folder in os.listdir(blogs_path):
            blog_folder = os.path.join(blogs_path, folder)
            if os.path.isdir(blog_folder):
                blog_json_path = os.path.join(blog_folder, 'blog-articulo.json')
                if os.path.exists(blog_json_path):
                    with open(blog_json_path, 'r', encoding='utf-8') as f:
                        blog_data = json.load(f)
                    blogs.append({
                        'folder': folder,
                        'titulo': blog_data.get('titulo', 'Sem titulo'),
                        'capa': blog_data.get('capa', 'capa.jpg'),
                        'autor': blog_data.get('autor', '-'),
                        'data': blog_data.get('data', '-')
                    })
    #Obter contatos via email (solução paliativa)
    contact_data = []
    contact_json_path = os.path.join(app.static_folder, 'data', 'contact_submissions.json')

    if os.path.exists(contact_json_path):
        try:
            with open(contact_json_path, 'r', encoding='utf-8') as json_file:
                contact_data = json.load(json_file)
        except Exception as e:
            print(f"Error al cargar los datos de contactos: {e}")

    return render_template('dashboard.html', 
                           slider_images=enumerated_slider_images,
                           second_section=data.get('second_section', {}),
                           third_section=data.get('third_section', {}),
                           blogs=blogs,
                           contact_data=contact_data)


@app.route('/get_json', methods=['GET'])
def get_json():
    path = request.args.get('path')
    full_path = os.path.join(app.static_folder, path.strip('/'))
    if not os.path.exists(full_path):
        return jsonify({"error": "Archivo no encontrado"}), 404

    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/save_json', methods=['POST'])
def save_json():
    path = request.args.get('path')
    full_path = os.path.join(app.static_folder, path.strip('/'))
    if not os.path.exists(full_path):
        return jsonify({"error": "Archivo no encontrado"}), 404

    try:
        updated_data = request.get_json()
        with open(full_path, 'w', encoding='utf-8') as f:
            json.dump(updated_data, f, ensure_ascii=False, indent=4)
        return jsonify({"success": "Archivo guardado exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/list_files')
def list_files():
    # Obtener la ruta desde los parámetros de la solicitud, con 'img/projetos' como base
    path = request.args.get('path', 'img/projetos')  # Ruta inicial por defecto

    # Asegurarse de que 'path' sea una ruta válida dentro de 'static/img'
    full_path = os.path.join(app.static_folder, path.strip('/'))

    # Verificar si la ruta es válida y es un directorio
    if not os.path.exists(full_path) or not os.path.isdir(full_path):
        return jsonify({'error': 'Ruta no encontrada'}), 404

    folders = []
    files = []

    # Listar carpetas y archivos
    for item in os.listdir(full_path):
        item_path = os.path.join(full_path, item)
        if os.path.isdir(item_path):
            folders.append(item)
        else:
            files.append(item)

    # Formatear las rutas para el frontend
    formatted_folders = [{'name': folder, 'path': os.path.join(path, folder).replace('\\', '/')} for folder in folders]
    formatted_files = [{'name': file, 'path': os.path.join(path, file).replace('\\', '/')} for file in files]

    return jsonify({'folders': formatted_folders, 'files': formatted_files})


@app.route('/edit_file', methods=['GET', 'POST'])
def edit_file():
    path = request.args.get('path')  # Obtener la ruta del archivo desde los parámetros

    if not path:
        return "Ruta no proporcionada", 400

    full_path = os.path.join(app.static_folder, path)  # Ruta completa al archivo

    if request.method == 'GET':
        # Leer y devolver el contenido del archivo
        if os.path.exists(full_path):
            with open(full_path, 'r', encoding='utf-8') as f:
                return f.read(), 200  # Devuelve el contenido del archivo como texto
        return "Archivo no encontrado", 404

    if request.method == 'POST':
        # Guardar el nuevo contenido en el archivo
        data = request.get_json()  # Obtener los datos enviados desde el cliente
        new_content = data.get('content', '')
        try:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(new_content)  # Escribir el contenido en el archivo
            return "Archivo guardado con éxito", 200
        except Exception as e:
            return f"Error al guardar el archivo: {str(e)}", 500


#----------------------------------------------
#----------------------------------------------
#----------------------------------------------
#----------------------------------------------
#CRUD NO SISTEMA DE ARQUIVOS - PROJETOS

@app.route('/rename_item', methods=['POST'])
def rename_item():
    path = request.args.get('path')
    new_name = request.args.get('new_name')
    try:
        full_path = os.path.join(app.static_folder, path.strip('/'))
        dir_path = os.path.dirname(full_path)   # Pasta onde está o item atual
        base_name = os.path.basename(full_path) # Nome do arquivo/pasta atual

        if os.path.isfile(full_path):
            # É arquivo: preserva a extensão do arquivo original
            _, old_ext = os.path.splitext(base_name) 
            # Ignora qualquer extensão que o usuário tenha digitado
            new_filename = secure_filename(new_name) + old_ext
        else:
            # É pasta: não tem extensão
            new_filename = secure_filename(new_name)

        new_path = os.path.join(dir_path, new_filename)

        os.rename(full_path, new_path)

        return jsonify({"success": True})
    except Exception as e:
        print(f"Error al renombrar el item: {e}")
        return jsonify({"error": str(e)}), 500



from urllib.parse import unquote

@app.route('/create_folder', methods=['POST'])
def create_folder():
    try:
        # Obtener y validar los parámetros
        path = request.args.get('path')
        folder_name = request.args.get('name')

        if not path or not folder_name:
            return jsonify({"error": "Ruta o nombre de la carpeta no proporcionados"}), 400

        # Decodificar y limpiar la ruta
        decoded_path = unquote(path).strip()
        # Substitui " / " por "/" para evitar path com espaços
        decoded_path = decoded_path.replace(" / ", "/")
        # Converte barras invertidas para barras normais
        decoded_path = decoded_path.replace("\\", "/")
        # Remove barras finais extras
        decoded_path = decoded_path.strip("/")

        base_path = os.path.join(app.static_folder, decoded_path)

        # Normalizar la ruta completa
        new_folder_path = os.path.normpath(os.path.join(base_path, secure_filename(folder_name)))

        # Verificar si la carpeta ya existe
        if os.path.exists(new_folder_path):
            return jsonify({"error": "La carpeta ya existe"}), 400

        # Crear la carpeta
        os.makedirs(new_folder_path)
        return jsonify({"success": "Carpeta creada con éxito"}), 200

    except Exception as e:
        print(f"Error al crear la carpeta: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/create_sub_folder_with_info", methods=["POST"])
def create_sub_folder_with_info():
    """
    Cria uma subpasta DENTRO de "img/projetos/xxx" contendo
    um info.json obrigatório com (medidas, ano, endereco, tipo).
    """
    try:
        path        = request.form.get("path")         # ex: "img/projetos/categoriaX"
        folder_name = request.form.get("folder_name")  # subpasta que queremos criar
        medidas     = request.form.get("medidas")
        ano         = request.form.get("ano")
        endereco    = request.form.get("endereco")
        tipo        = request.form.get("tipo")

        # Validações simples
        if not (path and folder_name and medidas and ano and endereco and tipo):
            return jsonify({"error": "Faltam campos obrigatórios (path, folder_name, medidas, ano, endereco, tipo)"}), 400

        # Montar caminho base
        base_path = os.path.join(app.static_folder, path.strip("/"))
        if not os.path.isdir(base_path):
            return jsonify({"error": "O caminho base não existe ou não é uma pasta válida"}), 400

        # Criar a subpasta
        new_folder = secure_filename(folder_name)
        new_folder_path = os.path.join(base_path, new_folder)

        if os.path.exists(new_folder_path):
            return jsonify({"error": "La carpeta ya existe"}), 400

        os.makedirs(new_folder_path)

        # Criar info.json obrigatório
        info_data = {
            "medidas": medidas,
            "ano": ano,
            "endereco": endereco,
            "tipo": tipo
        }
        json_path = os.path.join(new_folder_path, "info.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(info_data, f, ensure_ascii=False, indent=4)

        return jsonify({"success": True}), 200

    except Exception as e:
        print(f"Erro ao criar subpasta com info: {e}")
        return jsonify({"error": str(e)}), 500




@app.route('/upload_files', methods=['POST'])
def upload_files():
    try:
        # Obtener la ruta desde los parámetros
        path = request.args.get('path')
        if not path:
            return jsonify({"error": "Ruta no proporcionada"}), 400

        # Construir la ruta completa
        full_path = os.path.join(app.static_folder, path.strip('/'))

        # Verificar si la ruta existe
        if not os.path.exists(full_path):
            return jsonify({"error": "La ruta no existe"}), 400

        # Subir los archivos
        files = request.files.getlist('files')
        for file in files:
            filename = secure_filename(file.filename)
            file.save(os.path.join(full_path, filename))

        return jsonify({"success": "Archivos subidos con éxito"}), 200

    except Exception as e:
        print(f"Error al subir archivos: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/delete_item', methods=['POST'])
def delete_item():
    try:
        # Obtener la ruta desde los parámetros
        path = request.args.get('path')
        if not path:
            return jsonify({"error": "Ruta no proporcionada"}), 400

        # Construir la ruta completa
        full_path = os.path.join(app.static_folder, path.strip('/'))

        # Verificar si la ruta existe
        if not os.path.exists(full_path):
            return jsonify({"error": "El elemento no existe"}), 404

        # Eliminar archivo o carpeta
        if os.path.isfile(full_path):
            os.remove(full_path)
        elif os.path.isdir(full_path):
            # Manejar problemas de permisos con `shutil.rmtree`
            def on_error(func, path, exc_info):
                print(f"Error eliminando {path}: {exc_info}")  # Log de errores
                os.chmod(path, 0o777)  # Cambiar permisos
                func(path)  # Reintentar

            shutil.rmtree(full_path, onerror=on_error)

        return jsonify({"success": "Elemento eliminado con éxito"}), 200

    except Exception as e:
        print(f"Error al eliminar el item: {e}")
        return jsonify({"error": str(e)}), 500
    
# Landing page antiga
@app.route('/projetos/residencias-242')
def residencias_242():
    # Definir el nombre del proyecto
    nome_projeto = "Residencias_242"

    # Definir el contenido de la segunda sección
    second_section = {
        "title": "Sobre o Projeto",
        "text": """Esse projeto tem como conceito explorar as texturas dos materiais em seu estado bruto. Nosso principal objetivo era criar uma arquitetura com custo reduzido sem perder qualidade plástica, visual e experimental. Gostamos do efeito que os materiais produzem dentro e fora da casa ao que se refere a suas texturas e formas originais. 
        
        Na cobertura utilizamos laje painel aparente no seu interior e sua superfície superior impermeabilizada dispensando uso de estrutura de telhado, telhas pesadas, platibandas e consequentemente reduzindo o peso na estrutura da casa. As paredes são de alvenaria estrutural de blocos de concreto e tijolos cerâmicos maciços dispensando uso de pilares e vigas. Esta casa recebe luz natural das janelas triangulares que nasceram devido ao formato do telhado no pé direito duplo no centro da casa (sala de estar) ajudando a iluminar o interior visto que a construção aproveita toda a largura do terreno, compensando o fato de não poder ter janelas nas laterais. Além disso conseguimos aproveitar bem o espaço com uma cozinha de bancada em ilha integrada com sala de jantar, sala de estar e comunicação direta com a churrasqueira externa e deck de madeira para momentos de lazer."""
    }

    # Ruta a la carpeta de imágenes
    imagens_path = os.path.join(app.static_folder, 'img', '242')

    # Obtener todas las imágenes de la carpeta 242
    imagens = []
    if os.path.exists(imagens_path):
        for file_name in os.listdir(imagens_path):
            if file_name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.mp4')):
                relative_path = f'img/242/{file_name}'
                file_url = url_for('static', filename=relative_path)

                # Diferenciar imágenes y videos
                if file_name.lower().endswith('.mp4'):
                    imagens.append({'url': file_url, 'tipo': 'video'})
                else:
                    # Clases aleatorias para la galería
                    clases = ['wide', 'tall', 'medium', '']
                    imagens.append({'url': file_url, 'tipo': 'imagen', 'clase': random.choice(clases)})

    return render_template(
        '242.html',
        nome_projeto=nome_projeto,
        imagens=imagens,
        second_section=second_section  # Pasamos la sección para que se muestre en HTML
    )



#----------------------------------------------
#----------------------------------------------
#----------------------------------------------
#----------------------------------------------

#if __name__ == '__main__':
#    app.run(debug=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
