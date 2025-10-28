import { BALLZ, Ball, Vector, energiaMecanica, calcularExcentricidade,  convertVelocityUAYearToPixelsSec,
    acceleration,accrk2mid, attaRK4, Camera, applyCameraTransform, brilho,
    setOffset, setScale, getOffset, getScale, atualizarPainelPlaneta

} from "./funcoes.js";

let planetaFocado = null;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let tempo = 0
let scale = 0.3;
// 1 UA = 200 pixels
const UA_TO_PIXELS = 7000;
const G = 39.48;
//const dt = 0.0009;
const dt = 0.00019;
// Sistema solar centralizado
const sol = new Ball(2, 1, 20, 1,'Sol',1.4,0,5778,'estrela');
sol.vel = new Vector(0,0);

const terra = new Ball(2+1, 1, 15, 3e-6, 'Terra',5.5,1,288,'planeta rochoso');
let vterra = convertVelocityUAYearToPixelsSec(6.28, UA_TO_PIXELS);
terra.vel = new Vector(0, 6.28);

const lua = new Ball(2+1 + 0.0026, 1, 3, 3.7e-8,'Lua',3.3,0,220,'satélite');
let vlua = convertVelocityUAYearToPixelsSec(0.21, UA_TO_PIXELS);
lua.vel = new Vector(0, 6.28 + 0.21);

let mercurio = new Ball(2+ 0.39, 1, 9, 1e-7,'Mercúrio',5.4,0,452,'planeta rochoso');
mercurio.vel = new Vector(0, 10.21);

let venus = new Ball(2 + 0.72, 1, 9, 2.45e-6,'Vênus',5.2,0,737,'planeta rochoso');
venus.vel = new Vector(0, 7.29);

let marte = new Ball(2 + 1.52, 1, 10, 3.23e-7,'Marte',3.9,2,208,'planeta rochoso');
marte.vel = new Vector(0, 5.08);

let jupter = new Ball(2 + 5.2, 1, 10, 9.55e-4,'Júpiter',1.3,95,165,'planeta gasoso');
jupter.vel = new Vector(0, 2.75);

let saturno = new Ball(2 + 9.58, 1, 10, 2.86e-4,'Saturno',0.69,146,134,'planeta gasoso');
saturno.vel = new Vector(0, 2.03);

let urano = new Ball(2 + 19.2, 1, 10, 4.37e-5,'Urano',1.27,28,76, 'planeta gasoso');
urano.vel = new Vector(0, 1.44);

let netuno = new Ball(2 + 30, 1, 10, 5.15e-5,'Netuno',1.64,16,72,'planeta gasoso');
netuno.vel = new Vector(0,  1.15);


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



function addTrail() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

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


// === PAINEL FIXO - CRIADO UMA VEZ ===
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

// HTML INICIAL do painel (sem dados dinâmicos ainda)
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
    <p><b>🔄 Excentricidade Terra:</b> <span id="info-excentricidade">0</span></p>
    <p><b>🔍 Zoom:</b> <span id="info-zoom">0</span>x</p>
    <p><b>🪐 Planetas:</b> <span id="info-num-planetas">0</span></p>
    <p><b>📏 Rastros:</b> <span id="info-rastros">Ligados</span></p>
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



function atualizarPainel() {
    const energiamecanica = energiaMecanica(BALLZ, G);
    const eterra = calcularExcentricidade(terra, sol, G);
    
    // Apenas atualiza os valores, não recria o HTML
    document.getElementById("info-energia").textContent = energiamecanica.toExponential(3);
    document.getElementById("info-tempo").textContent = tempo.toFixed(2);
    document.getElementById("info-excentricidade").textContent = eterra.toFixed(4);
    document.getElementById("info-zoom").textContent = scale.toFixed(2);
    document.getElementById("info-num-planetas").textContent = BALLZ.length;
    document.getElementById("info-rastros").textContent = showTrails ? "Ligados" : "Desligados";
}


// Função resetarCamera
function resetarCamera() {
    window.planetaSeguido = null;
    scale = 0.3;
    offsetX = canvas.width / 2 - sol.pos.x * UA_TO_PIXELS * scale;
    offsetY = canvas.height / 2 - sol.pos.y * UA_TO_PIXELS * scale;
    
    // Resetar seleção visual dos botões
    document.querySelectorAll('.btn-planeta').forEach(b => {
        b.style.background = "rgba(50, 50, 50, 0.7)";
        b.style.borderColor = "rgba(100, 100, 100, 0.5)";
    });
    
    console.log("Câmera resetada para o Sol");
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

let showTrails = true;

function loop() {
    // Limpa o canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Atualiza a câmera (IMPORTANTE: deve ser chamado antes de applyCameraTransform)
    atualizarCamera();


    // Aplica a transformação da câmera
    applyCameraTransform(ctx);

    // Atualiza a física
    attaRK4(dt, BALLZ, G);

    // Desenha os planetas
    for(let b of BALLZ) {
        // Usando raio fixo de 4 pixels para melhor visualização
        b.desenharBola(UA_TO_PIXELS, 4);
        b.desenharRastro(UA_TO_PIXELS);
        b.desenharPainel();
    }
    

    // Remove a transformação da câmera
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    desenharEstrelas();

    // Atualiza o painel de informações
    atualizarPainel();

    atualizarPainelPlaneta();

    // Incrementa o tempo
    tempo += dt;

    requestAnimationFrame(loop);
}
loop();
