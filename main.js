import { BALLZ, Ball, Vector, energiaMecanica,  convertVelocityUAYearToPixelsSec,
    acceleration,accrk2mid, attaRK4, Camera, applyCameraTransform,
    atualizarPainelPlaneta, medirPeriodo

} from "./funcoes.js";


// ===== Inicializacao do Canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// ===== Configuraçōes Globais
let tempo = 0
let scale = 0.3;
const UA_TO_PIXELS = 7000;
const G = 39.48;
const dt = 0.00001;
let speedMultiplier = 1;


// ===== Variaveis de Estado
let planetaFocado = null;
let paused = false;
let animationId = null;
let modoRealista = false;


// ===== Sistema Solar
const sol = new Ball(2, 1, 600, 1,'Sol',1.4,0,5778,'estrela');
sol.vel = new Vector(0,0);

const terra = new Ball(2+1, 1, 25, 3e-6, 'Terra',5.5,1,288,'planeta rochoso');
let vterra = convertVelocityUAYearToPixelsSec(6.28, UA_TO_PIXELS);
terra.vel = new Vector(0, 6.28);

const lua = new Ball(2+1 + 0.0026, 1, 5, 3.7e-8,'Lua',3.3,0,220,'satélite');
let vlua = convertVelocityUAYearToPixelsSec(0.21, UA_TO_PIXELS);
lua.vel = new Vector(0, 6.28 + 0.21);

let mercurio = new Ball(2+ 0.39, 1, 30, 1e-7,'Mercúrio',5.4,0,452,'planeta rochoso');
mercurio.vel = new Vector(0, 10.21);

let venus = new Ball(2 + 0.72, 1, 40, 2.45e-6,'Vênus',5.2,0,737,'planeta rochoso');
venus.vel = new Vector(0, 7.29);

let marte = new Ball(2 + 1.52, 1, 50, 3.23e-7,'Marte',3.9,2,208,'planeta rochoso');
marte.vel = new Vector(0, 5.08);

let jupter = new Ball(2 + 5.2, 1, 300, 9.55e-4,'Júpiter',1.3,95,165,'planeta gasoso');
jupter.vel = new Vector(0, 2.75);

let saturno = new Ball(2 + 9.58, 1, 100, 2.86e-4,'Saturno',0.69,146,134,'planeta gasoso');
saturno.vel = new Vector(0, 2.03);

let urano = new Ball(2 + 19.2, 1, 100, 4.37e-5,'Urano',1.27,28,76, 'planeta gasoso');
urano.vel = new Vector(0, 1.44);

let netuno = new Ball(2 + 30, 1, 100, 5.15e-5,'Netuno',1.64,16,72,'planeta gasoso');
netuno.vel = new Vector(0,  1.15);

// ===== Carregar Imagens
Camera(canvas);
terra.carregarImagem('imagens/terrapixel.png');
saturno.carregarImagem('imagens/saturnopixel.png')
mercurio.carregarImagem("imagens/mercuriopixel.png")
venus.carregarImagem("imagens/venuspixel.png");
jupter.carregarImagem("imagens/jupiterpixel.png");
urano.carregarImagem("imagens/uranopixel.png");
netuno.carregarImagem("imagens/netunopixel.png");
marte.carregarImagem("imagens/martepixel.png")
sol.carregarImagem("imagens/solpixel.png")
lua.carregarImagem("imagens/luxpixel.png");



// ===== Fundo Estrelado
let stars = []
export function criarFundoEstrelado() {
    for (let i = 0; i < 500; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            brightness: Math.random() * 0.8 + 0.2
        });
    }
}
export function desenharEstrelas() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}
criarFundoEstrelado();
desenharEstrelas();


// ===== Interface do Usuario ===== //
function desenharInterface() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Fundo semi-transparente
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 300, 120);
    
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    
    // Use os cálculos que já estão sendo feitos no loop
    ctx.fillText(`Energia: ${energiaMecanica(BALLZ, G).toExponential(3)}`, 20, 25);
    ctx.fillText(`Tempo: ${tempo.toFixed(1)} anos`, 20, 45);
    ctx.fillText(`Excentricidade Terra: ${calcularExcentricidade(terra, sol, G).toFixed(4)}`, 20, 65);
    ctx.fillText(`Zoom: ${scale.toFixed(2)}x`, 20, 85);
    ctx.fillText(`Rastros: ${showTrails ? "LIGADOS" : "DESLIGADOS"}`, 20, 105);
}
const atualizarCamera = Camera(canvas, UA_TO_PIXELS);

const painel = document.createElement("div");
painel.id = "painel-info";
painel.style.position = "absolute";
painel.style.top = "10px";
painel.style.left = "10px";
painel.style.background = "rgba(0, 0, 0, 0.85)";
painel.style.color = "white";
painel.style.padding = "15px";
painel.style.borderRadius = "10px";
painel.style.fontFamily = "Arial, sans-serif";
painel.style.fontSize = "14px";
painel.style.width = "320px";
painel.style.boxShadow = "0 0 25px rgba(0, 0, 0, 0.6)";
painel.style.zIndex = "1000";
painel.style.backdropFilter = "blur(5px)";
painel.style.border = "1px solid rgba(255, 255, 255, 0.1)";


painel.innerHTML = `
    <h3 style="margin-top:0; color: #64B5F6; border-bottom: 1px solid #444; padding-bottom: 8px;">🌌 Sistema Solar</h3>
    
    <!-- Seletor de Planetas -->
    <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #aaa;">
            🎯 Focar Planeta:
        </label>
        <select id="seletorPlanetas" 
                style="width: 100%; padding: 8px; background: rgba(30,30,40,0.9); 
                       color: white; border: 1px solid #444; border-radius: 5px;
                       font-size: 12px;">
            <option value="">-- Visão Geral --</option>
            <option value="sol">☀️ Sol</option>
            <option value="mercurio">🪐 Mercúrio</option>
            <option value="venus">🪐 Vênus</option>
            <option value="terra">🪐 Terra</option>
            <option value="marte">🪐 Marte</option>
            <option value="jupter">🪐 Júpiter</option>
            <option value="saturno">🪐 Saturno</option>
            <option value="urano">🪐 Urano</option>
            <option value="netuno">🪐 Netuno</option>
        </select>
    </div>

    <p><b>⭐ Energia mecânica:</b> <span id="info-energia">0</span></p>
    <p><b>⏱️ Tempo decorrido:</b> <span id="info-tempo">0</span> anos</p>
    <hr style="border-color:#444; margin: 12px 0;">
    <p style="font-size:12px; color:#aaa; margin-bottom:0;">
        🖱️ Clique nos planetas para focar<br>
        🎲 Scroll para zoom<br>
        Arraste para mover
    </p>
`;

document.body.appendChild(painel);

// Event listener do seletor (APENAS UMA VEZ)
document.getElementById("seletorPlanetas").addEventListener("change", function() {
    const planetaNome = this.value;
    focarPlaneta(planetaNome);
});
// === FIM DO PAINEL FIXO ===


// ===== Funcoes de Controle 
function atualizarPainel() {
    const energiamecanica = energiaMecanica(BALLZ, G);
    
    // Apenas atualiza os valores, não recria o HTML
    document.getElementById("info-energia").textContent = energiamecanica.toExponential(3);
    document.getElementById("info-tempo").textContent = tempo.toFixed(2);
}

function resetarCamera() {
    window.planetaSeguido = null;
    window.planetaSelecionado = null;
    setScale(0.3);
    const offsetX = canvas.width / 2 - sol.pos.x * UA_TO_PIXELS * 0.3;
    const offsetY = canvas.height / 2 - sol.pos.y * UA_TO_PIXELS * 0.3;
    setOffset(offsetX, offsetY);
    
    // Resetar seleção visual
    document.getElementById("seletorPlanetas").value = "";
    
    console.log("Câmera resetada para visão geral");
}

function focarPlaneta(nomePlaneta) {
    let planeta;
    
    switch(nomePlaneta) {
        case 'sol': planeta = sol; break;
        case 'mercurio': planeta = mercurio; break;
        case 'venus': planeta = venus; break;
        case 'terra': planeta = terra; break;
        case 'marte': planeta = marte; break;
        case 'jupter': planeta = jupter; break;
        case 'saturno': planeta = saturno; break;
        case 'urano': planeta = urano; break;
        case 'netuno': planeta = netuno; break;
        default: 
            window.planetaSeguido = null;
            window.planetaSelecionado = null;
            console.log("🏁 Visão geral ativada");
            return;
    }
    
    if (planeta) {
        window.planetaSeguido = planeta;
        window.planetaSelecionado = planeta;
        console.log(`🎯 Focando em: ${planeta.name}`);
    }
}

// Botão de Pausa
const pauseButton = document.createElement("button");
pauseButton.innerHTML = "⏸️ Pausar";
pauseButton.style.position = "absolute";
pauseButton.style.bottom = "20px";
pauseButton.style.left = "20px";
pauseButton.style.background = "rgba(0, 0, 0, 0.8)";
pauseButton.style.color = "white";
pauseButton.style.border = "1px solid rgba(255, 255, 255, 0.3)";
pauseButton.style.borderRadius = "5px";
pauseButton.style.padding = "10px 15px";
pauseButton.style.fontSize = "14px";
pauseButton.style.cursor = "pointer";
pauseButton.style.zIndex = "1000";
document.body.appendChild(pauseButton);

pauseButton.addEventListener("click", () => {
    paused = !paused;
    if (paused) {
        pauseButton.innerHTML = "▶️ Retomar";
        console.log("Simulação pausada");
    } else {
        pauseButton.innerHTML = "⏸️ Pausar";
        console.log("Simulação retomada");
    }
});

// Slider de Velocidade
const speedContainer = document.createElement("div");
speedContainer.style.position = "absolute";
speedContainer.style.bottom = "70px"; // Acima do botão de pausa
speedContainer.style.left = "20px";
speedContainer.style.background = "rgba(0, 0, 0, 0.8)";
speedContainer.style.color = "white";
speedContainer.style.border = "1px solid rgba(255, 255, 255, 0.3)";
speedContainer.style.borderRadius = "5px";
speedContainer.style.padding = "10px 15px";
speedContainer.style.fontSize = "14px";
speedContainer.style.zIndex = "1000";
speedContainer.style.minWidth = "200px";

speedContainer.innerHTML = `
    <div style="margin-bottom: 5px;">🚀 Velocidade: <span id="speedValue">1x</span></div>
    <input type="range" id="speedSlider" min="1" max="100" step="0.1" value="1" 
           style="width: 100%; cursor: pointer;">
    <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 2px;">
        <span>1x</span>
        <span>50x</span>
        <span>100x</span>
    </div>
`;

document.body.appendChild(speedContainer);

const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");

speedSlider.addEventListener("input", function() {
    speedMultiplier = parseFloat(this.value);
    speedValue.textContent = speedMultiplier.toFixed(1) + "x";
    console.log(`Velocidade: ${speedMultiplier.toFixed(1)}x`);
});
// === Fim do Painel Interativo ===



// ===== BOTÃO DE TAMANHO REALISTA ===== ///
const RAIO_REALISTA = {
    'Sol': 0.00465,           // ~696,340 km em UA
    'Mercúrio': 0.0000165,    // ~2,440 km em UA
    'Vênus': 0.0000407,       // ~6,052 km em UA
    'Terra': 0.0000426,       // ~6,371 km em UA
    'Lua': 0.0000116,         // ~1,737 km em UA
    'Marte': 0.0000227,       // ~3,390 km em UA
    'Júpiter': 0.000467,      // ~69,911 km em UA
    'Saturno': 0.000389,      // ~58,232 km em UA
    'Urano': 0.000169,        // ~25,362 km em UA
    'Netuno': 0.000164        // ~24,622 km em UA
};

// ===== RAIO VISUAL ATUAL (para poder alternar) =====
const RAIO_VISUAL = {
    'Sol': sol.r,
    'Mercúrio': mercurio.r,
    'Vênus': venus.r,
    'Terra': terra.r,
    'Lua': lua.r,
    'Marte': marte.r,
    'Júpiter': jupter.r,
    'Saturno': saturno.r,
    'Urano': urano.r,
    'Netuno': netuno.r
};

const realistaButton = document.createElement("button");
realistaButton.innerHTML = "Tamanho Real";
realistaButton.style.position = "absolute";
realistaButton.style.bottom = "20px"; 
realistaButton.style.left = "130px";
realistaButton.style.background = "rgba(0, 0, 0, 0.8)";
realistaButton.style.color = "white";
realistaButton.style.border = "1px solid rgba(255, 255, 255, 0.3)";
realistaButton.style.borderRadius = "5px";
realistaButton.style.padding = "10px 15px";
realistaButton.style.fontSize = "14px";
realistaButton.style.cursor = "pointer";
realistaButton.style.zIndex = "1000";
document.body.appendChild(realistaButton);

realistaButton.addEventListener("click", alternarTamanhoRealista);

function alternarTamanhoRealista() {
    modoRealista = !modoRealista;
    
    const planetas = {
        'Sol': sol,
        'Mercúrio': mercurio,
        'Vênus': venus,
        'Terra': terra,
        'Lua': lua,
        'Marte': marte,
        'Júpiter': jupter,
        'Saturno': saturno,
        'Urano': urano,
        'Netuno': netuno
    };
    
    for (const [nome, planeta] of Object.entries(planetas)) {
        if (modoRealista) {
            planeta.r = RAIO_REALISTA[nome] * UA_TO_PIXELS;
        } else {
            planeta.r = RAIO_VISUAL[nome];
        }
    }
    
    realistaButton.innerHTML = modoRealista ? "Modo Visual" : "Tamanho Real";
    
    console.log(`Modo ${modoRealista ? 'REALISTA' : 'VISUAL'} ativado (zoom: ${scale}x)`);
}
RAIO_VISUAL['Sol'] = sol.r;
RAIO_VISUAL['Mercúrio'] = mercurio.r;
RAIO_VISUAL['Vênus'] = venus.r;
RAIO_VISUAL['Terra'] = terra.r;
RAIO_VISUAL['Lua'] = lua.r;
RAIO_VISUAL['Marte'] = marte.r;
RAIO_VISUAL['Júpiter'] = jupter.r;
RAIO_VISUAL['Saturno'] = saturno.r;
RAIO_VISUAL['Urano'] = urano.r;
RAIO_VISUAL['Netuno'] = netuno.r;


// ==== LOOP PRINCIPAL ====
function loop() {
    if (!paused) {
        // Limpa o canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Atualiza a câmera
        atualizarCamera();

        // Aplica a transformação da câmera
        applyCameraTransform(ctx);

        // Atualiza a física COM MULTIPLICADOR DE VELOCIDADE
        attaRK4(dt * speedMultiplier, BALLZ, G);

        // Desenha os planetas
        for(let b of BALLZ) {
            b.desenharBola(UA_TO_PIXELS, 4);
            b.desenharRastro(UA_TO_PIXELS);
            b.desenharPainel();
            medirPeriodo(b, sol, tempo);
        }

        // Remove a transformação da câmera
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        desenharEstrelas();

        // Atualiza os painéis
        atualizarPainel();
        atualizarPainelPlaneta();

        // Incrementa o tempo COM MULTIPLICADOR DE VELOCIDADE
        tempo += dt * speedMultiplier;
    }
    
    animationId = requestAnimationFrame(loop);
}
loop();
