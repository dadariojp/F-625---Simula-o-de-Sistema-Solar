# Simulação 2D do Sistema Solar

## Descrição do Projeto

Simulação educacional do sistema solar desenvolvida em JavaScript, criada como ferramenta de auxílio para o ensino de astronomia em instituições de educação básica. O projeto implementa um modelo físico preciso do sistema solar em duas dimensões, permitindo a visualização interativa dos movimentos planetários e estudos de mecânica celeste.

## Características Principais

### Simulação Física
- Modelo gravitacional baseado na Lei da Gravitação Universal
- Implementação do método Runge-Kutta de 4ª ordem (RK4) para integração numérica
- Cálculo de energia mecânica total do sistema em tempo real
- Medição automática do período orbital dos planetas

### Corpos Celestes Incluídos
- Sol
- 8 planetas do sistema solar (Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano, Netuno)
- Lua como satélite natural

### Funcionalidades de Visualização
- Sistema de câmera com controle de zoom e pan
- Alternância entre modos de tamanho realista e visual
- Rastros orbitais para análise do movimento
- Imagens texturizadas dos corpos celestes

### Interface do Usuário
- Painel informativo detalhado para cada corpo celeste
- Controles de velocidade de simulação
- Botão de pausa/retomar
- Seletor para focar em planetas específicos

## Tecnologias Utilizadas

- **JavaScript ES6+** - Lógica principal da simulação
- **HTML5 Canvas** - Renderização gráfica
- **CSS3** - Estilização da interface
- **GitHub Pages** - Hospedagem e deploy

## Estrutura do Projeto

sistema-solar-2d/
├── index.html
├── main.js
├── funcoes.js
└── imagens/
    ├── terrapixel.png
    ├── saturnopixel.png
    ├── mercuriopixel.png
    ├── venuspixel.png
    ├── jupiterpixel.png
    ├── uranopixel.png
    ├── netunopixel.png
    ├── martepixel.png
    ├── solpixel.png
    └── luapixel.png

## Instalação e Execução

### Pré-requisitos
- Navegador web moderno com suporte a JavaScript ES6+
- Servidor web local (recomendado para desenvolvimento)

### Execução Local
1. Clone o repositório:
```bash
git clone [url-do-repositório]
```



