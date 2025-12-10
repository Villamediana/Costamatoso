#!/usr/bin/env python3
"""
Script para analisar imagens do projeto:
- Média de tamanho
- Imagem mais pesada
- Imagem mais leve
- Quantidade total
- Peso total
"""

import os
from pathlib import Path
from collections import defaultdict

# Extensões de imagem suportadas
EXTENSOES_IMAGEM = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'}

def formatar_tamanho(bytes_size):
    """Converte bytes para formato legível"""
    for unidade in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.2f} {unidade}"
        bytes_size /= 1024.0
    return f"{bytes_size:.2f} TB"

def analisar_imagens(diretorio='static/img'):
    """Analisa todas as imagens no diretório"""
    diretorio_path = Path(diretorio)
    
    if not diretorio_path.exists():
        print(f"❌ Diretório não encontrado: {diretorio}")
        return
    
    imagens = []
    total_tamanho = 0
    por_pasta = defaultdict(list)
    
    print(f"🔍 Analisando imagens em: {diretorio_path.absolute()}\n")
    
    # Percorrer todos os arquivos
    for root, dirs, files in os.walk(diretorio_path):
        for arquivo in files:
            arquivo_path = Path(root) / arquivo
            extensao = arquivo_path.suffix.lower()
            
            if extensao in EXTENSOES_IMAGEM:
                try:
                    tamanho = arquivo_path.stat().st_size
                    relativo = arquivo_path.relative_to(diretorio_path)
                    
                    info = {
                        'caminho': str(relativo),
                        'caminho_absoluto': str(arquivo_path),
                        'tamanho': tamanho,
                        'pasta': str(Path(root).relative_to(diretorio_path))
                    }
                    
                    imagens.append(info)
                    total_tamanho += tamanho
                    
                    # Agrupar por pasta
                    pasta = info['pasta'] if info['pasta'] != '.' else 'raiz'
                    por_pasta[pasta].append(info)
                    
                except Exception as e:
                    print(f"⚠️  Erro ao processar {arquivo_path}: {e}")
    
    if not imagens:
        print("❌ Nenhuma imagem encontrada!")
        return
    
    # Ordenar por tamanho
    imagens_ordenadas = sorted(imagens, key=lambda x: x['tamanho'])
    
    # Estatísticas
    quantidade = len(imagens)
    media = total_tamanho / quantidade
    mais_leve = imagens_ordenadas[0]
    mais_pesada = imagens_ordenadas[-1]
    
    # Exibir resultados
    print("=" * 70)
    print("📊 ESTATÍSTICAS DE IMAGENS")
    print("=" * 70)
    print(f"\n📁 Total de imagens: {quantidade:,}")
    print(f"💾 Peso total: {formatar_tamanho(total_tamanho)}")
    print(f"📊 Média de tamanho: {formatar_tamanho(media)}")
    
    print(f"\n{'=' * 70}")
    print("📉 IMAGEM MAIS LEVE")
    print("=" * 70)
    print(f"📄 Arquivo: {mais_leve['caminho']}")
    print(f"💾 Tamanho: {formatar_tamanho(mais_leve['tamanho'])}")
    print(f"📁 Pasta: {mais_leve['pasta'] if mais_leve['pasta'] != '.' else 'raiz'}")
    
    print(f"\n{'=' * 70}")
    print("📈 IMAGEM MAIS PESADA")
    print("=" * 70)
    print(f"📄 Arquivo: {mais_pesada['caminho']}")
    print(f"💾 Tamanho: {formatar_tamanho(mais_pesada['tamanho'])}")
    print(f"📁 Pasta: {mais_pesada['pasta'] if mais_pesada['pasta'] != '.' else 'raiz'}")
    
    # Estatísticas por pasta
    print(f"\n{'=' * 70}")
    print("📂 ESTATÍSTICAS POR PASTA")
    print("=" * 70)
    
    pastas_ordenadas = sorted(por_pasta.items(), key=lambda x: sum(img['tamanho'] for img in x[1]), reverse=True)
    
    for pasta, imgs in pastas_ordenadas[:15]:  # Top 15 pastas
        total_pasta = sum(img['tamanho'] for img in imgs)
        media_pasta = total_pasta / len(imgs)
        print(f"\n📁 {pasta}:")
        print(f"   • Quantidade: {len(imgs):,} imagens")
        print(f"   • Total: {formatar_tamanho(total_pasta)}")
        print(f"   • Média: {formatar_tamanho(media_pasta)}")
    
    if len(pastas_ordenadas) > 15:
        print(f"\n   ... e mais {len(pastas_ordenadas) - 15} pastas")
    
    # Distribuição por tamanho
    print(f"\n{'=' * 70}")
    print("📊 DISTRIBUIÇÃO POR TAMANHO")
    print("=" * 70)
    
    pequenas = sum(1 for img in imagens if img['tamanho'] < 100 * 1024)  # < 100KB
    medias = sum(1 for img in imagens if 100 * 1024 <= img['tamanho'] < 500 * 1024)  # 100KB - 500KB
    grandes = sum(1 for img in imagens if 500 * 1024 <= img['tamanho'] < 2 * 1024 * 1024)  # 500KB - 2MB
    muito_grandes = sum(1 for img in imagens if img['tamanho'] >= 2 * 1024 * 1024)  # >= 2MB
    
    print(f"🟢 Pequenas (< 100KB): {pequenas:,} ({pequenas/quantidade*100:.1f}%)")
    print(f"🟡 Médias (100KB - 500KB): {medias:,} ({medias/quantidade*100:.1f}%)")
    print(f"🟠 Grandes (500KB - 2MB): {grandes:,} ({grandes/quantidade*100:.1f}%)")
    print(f"🔴 Muito grandes (>= 2MB): {muito_grandes:,} ({muito_grandes/quantidade*100:.1f}%)")
    
    print(f"\n{'=' * 70}")
    print("✅ Análise concluída!")
    print("=" * 70)

if __name__ == '__main__':
    analisar_imagens()

