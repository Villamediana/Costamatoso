# Sistema de Campanhas - Costa Matoso

## 📋 Visão Geral

Sistema completo de gerenciamento de campanhas com popups bonitos e responsivos para desktop e mobile.

## ✨ Funcionalidades

### Dashboard
- **Criar campanhas**: Upload de imagem, título, link e status (ativa/inativa)
- **Editar campanhas**: Modificar título, link e status
- **Excluir campanhas**: Remover campanhas existentes
- **Preview instantâneo**: Visualização da imagem ao selecionar
- **Gerenciamento de status**: Ativar/desativar campanhas

### Desktop (> 768px)
- **Popup centralizado**: Aparece 2 segundos após carregar a página
- **Slider automático**: Troca de campanha a cada 5 segundos
- **Navegação manual**: Botões de anterior/próximo
- **Dots de navegação**: Indicadores visuais da campanha atual
- **Animações suaves**: Transições elegantes com cubic-bezier
- **Fechar**: Botão X ou clicar no overlay
- **Abrir link**: Clique na imagem abre em nova aba

### Mobile (≤ 768px)
- **Bottom sheet**: Notificação que sobe de baixo
- **Swipe support**: Deslizar para trocar de campanha
- **Slider automático**: Troca a cada 5 segundos
- **Dots de navegação**: Indicadores visuais
- **Animações suaves**: Transições fluidas
- **Fechar**: Botão X ou clicar no overlay
- **Abrir link**: Toque na imagem abre em nova aba

## 🎨 Design

### Desktop
- Popup centralizado com border-radius 20px
- Sombra elegante: `0 20px 60px rgba(0, 0, 0, 0.3)`
- Botões circulares com hover effects
- Gradiente sutil de fundo
- Animação de entrada com scale e opacity

### Mobile
- Bottom sheet com border-radius superior
- Barra de arrasto visual no topo
- Altura máxima de 70vh
- Imagens com object-fit: contain
- Animação de entrada de baixo para cima

## 📁 Estrutura de Arquivos

```
static/
├── data/
│   └── campanhas.json          # Dados das campanhas
├── img/
│   └── campanhas/              # Imagens das campanhas
├── css/
│   └── campanhas.css           # Estilos dos popups
└── js/
    ├── campanhas.js            # Lógica de exibição
    └── dashboard.js            # Gerenciamento no dashboard
```

## 🔧 Rotas Backend

### GET `/get_campanhas`
Retorna todas as campanhas em JSON.

### POST `/save_campanhas`
Salva as campanhas (recebe JSON no body).

### POST `/upload_campanha_image`
Upload de imagem de campanha (multipart/form-data).

## 📊 Estrutura JSON

```json
[
  {
    "title": "Título da Campanha",
    "link": "https://exemplo.com",
    "image": "img/campanhas/imagem_123456.jpg",
    "active": true
  }
]
```

## 🚀 Como Usar

### 1. Acessar Dashboard
- Login: `costa@m4t0s0`
- Menu: "Campanhas"

### 2. Criar Campanha
1. Preencher título
2. Inserir link (com https://)
3. Fazer upload da imagem
4. Marcar como ativa (opcional)
5. Clicar em "Adicionar Campanha"

### 3. Editar Campanha
1. Modificar título ou link na tabela
2. Ativar/desativar checkbox
3. Clicar em "Salvar"

### 4. Excluir Campanha
1. Clicar em "Excluir"
2. Confirmar exclusão

## 🎯 Comportamento

- **Apenas campanhas ativas** aparecem no site
- **Múltiplas campanhas**: Slider automático + navegação manual
- **Uma campanha**: Sem botões de navegação
- **Nenhuma campanha**: Nada é exibido
- **Auto-play**: 5 segundos entre slides
- **Swipe mobile**: Suporte a gestos touch
- **Keyboard**: ESC fecha o popup

## 🎨 Customização

### Tempo de exibição inicial
Arquivo: `static/js/campanhas.js`
```javascript
setTimeout(() => {
    // Alterar 2000 para o tempo desejado em ms
}, 2000);
```

### Tempo do auto-play
Arquivo: `static/js/campanhas.js`
```javascript
autoPlayInterval = setInterval(() => {
    // Alterar 5000 para o tempo desejado em ms
}, 5000);
```

### Cores e estilos
Arquivo: `static/css/campanhas.css`
- Modificar cores, tamanhos, animações, etc.

## 📱 Responsividade

- **Desktop**: Popup centralizado (max-width: 700px)
- **Mobile**: Bottom sheet (max-height: 70vh)
- **Breakpoint**: 768px

## ⚡ Performance

- **Lazy loading**: Imagens carregam sob demanda
- **Passive listeners**: Touch events otimizados
- **CSS transitions**: Animações aceleradas por GPU
- **Fetch API**: Requisições assíncronas

## 🔒 Segurança

- **secure_filename**: Sanitização de nomes de arquivo
- **URL validation**: Validação de links no frontend
- **JSON encoding**: Proteção contra XSS

## 🐛 Troubleshooting

### Campanhas não aparecem
1. Verificar se há campanhas ativas
2. Checar console do navegador
3. Verificar se `campanhas.json` existe
4. Confirmar que o CSS e JS foram carregados

### Imagens não carregam
1. Verificar permissões da pasta `static/img/campanhas/`
2. Confirmar que o caminho no JSON está correto
3. Checar se a imagem existe fisicamente

### Swipe não funciona no mobile
1. Verificar se está em dispositivo touch
2. Confirmar que o JavaScript foi carregado
3. Checar console para erros

## 📝 Notas

- As campanhas são exibidas em **todas as páginas** do site
- O overlay escurece o fundo quando o popup está aberto
- As imagens são salvas com timestamp único para evitar conflitos
- O sistema é totalmente responsivo e adaptativo

