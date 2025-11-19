Simulação 2D do Sistema Solar
Descrição do Projeto
Simulação educacional do sistema solar desenvolvida em JavaScript, criada como ferramenta de auxílio para o ensino de astronomia em instituições de educação básica. O projeto implementa um modelo físico preciso do sistema solar em duas dimensões, permitindo a visualização interativa dos movimentos planetários e estudos de mecânica celeste.

Características Principais
Simulação Física
Modelo gravitacional baseado na Lei da Gravitação Universal

Implementação do método Runge-Kutta de 4ª ordem (RK4) para integração numérica

Cálculo de energia mecânica total do sistema em tempo real

Medição automática do período orbital dos planetas

Corpos Celestes Incluídos
Sol

8 planetas do sistema solar (Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano, Netuno)

Lua como satélite natural

Funcionalidades de Visualização
Sistema de câmera com controle de zoom e pan

Alternância entre modos de tamanho realista e visual

Rastros orbitais para análise do movimento

Imagens texturizadas dos corpos celestes

Interface do Usuário
Painel informativo detalhado para cada corpo celeste

Controles de velocidade de simulação

Botão de pausa/retomar

Seletor para focar em planetas específicos

Tecnologias Utilizadas
JavaScript ES6+ - Lógica principal da simulação

HTML5 Canvas - Renderização gráfica

CSS3 - Estilização da interface

GitHub Pages - Hospedagem e deploy

Estrutura do Projeto
text
sistema-solar-2d/
├── index.html          # Estrutura principal da página
├── main.js            # Lógica principal da aplicação
├── funcoes.js         # Funções auxiliares e classes
└── imagens/           # Texturas dos corpos celestes
    ├── terrapixel.png
    ├── saturnopixel.png
    ├── ...
Instalação e Execução
Pré-requisitos
Navegador web moderno com suporte a JavaScript ES6+

Servidor web local (recomendado para desenvolvimento)


Execução Local
Clone o repositório:

bash
git clone [url-do-repositório]
Inicie um servidor web local:

bash
# Usando Python
python -m http.server 8000

# Ou usando Node.js
npx http-server
Acesse http://localhost:8000 no navegador

Controles da Simulação
Navegação
Zoom: Scroll do mouse

Pan: Arrastar com o botão esquerdo do mouse

Seleção: Clique em qualquer planeta

Controles de Simulação
Velocidade: Slider no canto inferior esquerdo (1x a 100x)

Pausa/Retomar: Botão no canto inferior esquerdo

Modo Realista: Alterna entre tamanhos visuais e escalas reais

Detalhes Técnicos
Modelo Físico
Unidade Astronômica (UA) como base de distância

Massas solares como unidade de massa

Constante gravitacional: G = 39.48 UA³/(M☉·ano²)

Passo de integração temporal: dt = 0.00001 anos

Algoritmos Implementados
Runge-Kutta 4ª ordem para integração das equações diferenciais

Cálculo de energia mecânica para verificação da conservação

Detecção de período orbital através de acumulação angular

Otimizações
Transformações de coordenadas para eficiência visual

Sistema de rastros com limite de pontos

Controle de qualidade de renderização baseado em zoom

Dados Astronômicos
As informações dos corpos celestes (massas, densidades, períodos orbitais) foram obtidas do banco de dados da NASA, garantindo precisão científica nos parâmetros da simulação.

Limitações Conhecidas
Modelo restrito a duas dimensões

Ausência de correções relativísticas

Simplificação de interações gravitacionais múltiplas

Limitação computacional para adição de mais corpos celestes

Desenvolvimento Futuro
Implementação de correções pós-newtonianas

Expansão para três dimensões

Adição de satélites naturais adicionais

Otimização de performance para simulações de longo prazo

Implementação de sistema de colisões

Autores
Aurélio Miguel Perini Polli

João Pedro Dadario Pereira

João Vitor de Oliveira Perri

Licença
Este projeto é destinado para fins educacionais e de pesquisa.

Referências
NASA Solar System Exploration - Dados planetários

Fundamentals of Astrodynamics - Modelos orbitais

Numerical Recipes - Algoritmos de integração numérica


