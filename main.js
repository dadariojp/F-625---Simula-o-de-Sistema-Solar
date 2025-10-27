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
const sol = new Ball(2, 1, 400, 1);
sol.vel = new Vector(0,0);

const terra = new Ball(2+1, 1, 20, 3e-6);
terra.cor = "blue";
let vterra = convertVelocityUAYearToPixelsSec(6.28, UA_TO_PIXELS);
console.log("vterra", vterra);
terra.vel = new Vector(0, 6.28);

const lua = new Ball(2+1 + 0.0026, 1, 0.5, 20.7e-8);
let vlua = convertVelocityUAYearToPixelsSec(0.21, UA_TO_PIXELS);
lua.vel = new Vector(0, 6.28 + 0.21);

let mercurio = new Ball(2+ 0.39, 1, 10, 1e-7);
mercurio.vel = new Vector(0, 10.21);

let venus = new Ball(2 + 0.72, 1, 20, 2.45e-6);
venus.vel = new Vector(0, 7.29);

let marte = new Ball(2 + 1.52, 1, 20, 3.23e-7);
marte.vel = new Vector(0, 5.08);

let jupter = new Ball(2 + 5.2, 1, 30, 9.55e-4);
jupter.vel = new Vector(0, 2.75);

let saturno = new Ball(2 + 9.58, 1, 30, 2.86e-4);
saturno.vel = new Vector(0, 2.03);

let urano = new Ball(2 + 19.2, 1, 20, 4.37e-5);
urano.vel = new Vector(0, 1.44);

let netuno = new Ball(2 + 30, 1, 70, 5.15e-5);
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


// Criar painel de informações
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
document.body.appendChild(painel);

function atualizarPainel() {
    const energiamecanica = energiaMecanica(BALLZ, G);
    const eterra = calcularExcentricidade(terra, sol, G);
    
    painel.innerHTML = `
        <h3 style="margin-top:0; color: #64B5F6; border-bottom: 1px solid #444; padding-bottom: 8px;">🌌 Sistema Solar</h3>
        <p><b>⭐ Energia mecânica:</b> ${energiamecanica.toExponential(3)} J</p>
        <p><b>⏱️ Tempo decorrido:</b> ${tempo.toFixed(2)} anos</p>
        <p><b>🔄 Excentricidade Terra:</b> ${eterra.toFixed(4)}</p>
        <p><b>🔍 Zoom:</b> ${scale.toFixed(2)}x</p>
        <p><b>🪐 Planetas:</b> ${BALLZ.length}</p>
        <p><b>📏 Rastros:</b> ${showTrails ? "Ligados" : "Desligados"}</p>
        <hr style="border-color:#444; margin: 12px 0;">
        <p style="font-size:12px; color:#aaa; margin-bottom:0;">
            🖱️ Clique nos planetas para focar<br>
            🎲 Scroll para zoom<br>
            Arraste para mover
        </p>
    `;
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


let showTrails = true;

function loop() {

    console.log("Planetas na tela:", BALLZ.length);
for(let b of BALLZ) {
    console.log(`- ${b === sol ? 'Sol' : 'Planeta'}: (${b.pos.x}, ${b.pos.y})`);
}
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
