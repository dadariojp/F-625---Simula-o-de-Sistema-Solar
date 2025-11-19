# Simulação 2D do Sistema Solar

## Descrição do Projeto

Simulação educacional do sistema solar desenvolvida em JavaScript, criada como ferramenta de auxílio para o ensino de astronomia em instituições de educação básica. O projeto implementa um modelo físico preciso do sistema solar em duas dimensões, permitindo a visualização interativa dos movimentos planetários e estudos de mecânica celeste.

#Experimente a simulação agora mesmo!

A versão mais recente deste projeto está disponível no GitHub Pages:




## Características Principais

### Simulação Física
- Modelo gravitacional baseado na Lei da Gravitação Universal
- Implementação do método Runge-Kutta de 4ª ordem (RK4) para integração numérica [1]
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

- **JavaScript+** - Lógica principal da simulação
- **HTML5 Canvas** - Renderização gráfica
- **GitHub Pages** - Hospedagem e deploy


# Controles da Simulação

## Navegação
- **Zoom**: Scroll do mouse
- **Pan**: Arrastar com o botão esquerdo do mouse
- **Seleção**: Clique em qualquer planeta ou selecione na aba superior

## Controles de Simulação
- **Velocidade**: Slider no canto inferior esquerdo (1x a 100x)
- **Pausa/Retomar**: Botão no canto inferior esquerdo
- **Modo Realista**: Alterna entre tamanhos visuais e escalas reais

# Detalhes Técnicos

## Modelo Físico
- Unidade Astronômica (UA) como base de distância
- Massas solares como unidade de massa
- Constante gravitacional: G = 39.48 UA³/(M☉·ano²)
- Passo de integração temporal: dt = 0.00001 anos

## Algoritmos Implementados
- Runge-Kutta 4ª ordem para integração das equações diferenciais [1]
- Cálculo de energia mecânica para verificação da conservação 
- Detecção de período orbital através de acumulação angular

## Parâmetros dos Corpos Celestes
Os dados astronômicos (massas, densidades, períodos orbitais) foram obtidos do banco de dados da NASA [2], garantindo precisão científica nos parâmetros da simulação.

# Limitações Conhecidas
- Modelo restrito a duas dimensões
- Ausência de correções relativísticas
- Simplificação de interações gravitacionais múltiplas
- Limitação computacional para adição de mais corpos celestes

# Desenvolvimento Futuro
- Implementação de correções pós-newtonianas
- Expansão para três dimensões
- Adição de satélites naturais adicionais
- Otimização de performance para simulações de longo prazo
- Implementação de sistema de colisões

# Autores
- Aurélio Miguel Perini Polli (a256625@dac.unicamp.br)
- João Pedro Dadario Pereira (j249829@dac.unicamp.br)
- João Vitor de Oliveira Perri (j204515@dac.unicamp.br)

# Licença
Este projeto é destinado para fins educacionais e de pesquisa.

# Referências
- [1] Márcia Aparecida Gomes Ruggiero e Vera Lúcia da Rocha Lopes. Cálculo Numérico: Aspectos
Teóricos e Computacionais. Pearson Education do Brasil, 2ª ed.,pp. 331, 1997.
- [2] NASA. National Aeronautics and Space Administration. Acesso em: 26, Out. 2025 https://
science.nasa.gov/solar-system/planets/

---
**Projeto em desenvolvimento contínuo - Instituto de Física Gleb Wataghin (IFGW)**


