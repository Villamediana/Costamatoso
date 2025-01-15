import os
from PIL import Image
from tqdm import tqdm

def main():
    ruta_base = os.getcwd()
    
    # Extensiones que vamos a procesar
    extensiones_permitidas = (".png", ".jpg", ".jpeg")

    # Para almacenar rutas de imágenes y calcular el peso total
    imagenes = []
    peso_total = 0

    for carpeta_raiz, _, archivos in os.walk(ruta_base):
        for archivo in archivos:
            if archivo.lower().endswith(extensiones_permitidas):
                ruta_completa = os.path.join(carpeta_raiz, archivo)
                imagenes.append(ruta_completa)
                peso_total += os.path.getsize(ruta_completa)

    peso_total_mb = peso_total / (1024 * 1024)

    # Estimamos que bajando la calidad a 75 en JPG, o usando optimize en PNG,
    # obtendremos una reducción aproximada del 55% (ajusta según estimación).
    estimacion_final_mb = peso_total_mb * 0.45

    print(f"Se han encontrado {len(imagenes)} imagen(es).")
    print(f"Peso total aproximado: {peso_total_mb:.2f} MB.")
    print(f"Peso estimado tras la recompresión: {estimacion_final_mb:.2f} MB.\n")

    # Pedir confirmación
    opcion = input("¿Deseas recomprimir las imágenes manteniendo el mismo formato y eliminar los originales? (s/n): ")
    if opcion.lower() == 's':
        print("Iniciando recompresión...\n")

        for ruta_imagen in tqdm(imagenes, desc="Recomprimiendo", unit="imagen"):
            try:
                # Leer extensión
                _, extension = os.path.splitext(ruta_imagen)
                extension = extension.lower()
                
                # Construimos un nuevo nombre temporal (para no sobrescribir la original de inmediato)
                nombre_sin_ext = os.path.splitext(ruta_imagen)[0]
                nombre_temporal = nombre_sin_ext + "_temp" + extension

                with Image.open(ruta_imagen) as img:
                    # Ajustamos según sea JPG/JPEG o PNG
                    if extension in [".jpg", ".jpeg"]:
                        # Convertimos a RGB por si la imagen no viene en RGB
                        img = img.convert("RGB")
                        # Re-encode a JPG con calidad=75
                        img.save(nombre_temporal, "JPEG", optimize=True, quality=75)
                    elif extension == ".png":
                        # Si la imagen tiene canal alfa, mantenemos "RGBA"
                        if img.mode in ("RGBA", "LA"):
                            # No convertimos a RGB si queremos conservar la transparencia
                            pass
                        else:
                            img = img.convert("RGB")
                        # Re-encode a PNG con nivel de compresión alto
                        img.save(nombre_temporal, "PNG", optimize=True, compress_level=9)

                # Reemplazamos el archivo original con el temporal
                os.remove(ruta_imagen)
                os.rename(nombre_temporal, ruta_imagen)

            except Exception as e:
                print(f"Error al procesar {ruta_imagen}: {e}")

        print("\n¡Proceso finalizado!")
    else:
        print("Operación cancelada.")

if __name__ == "__main__":
    main()
