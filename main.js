import { BALLZ, Ball, Vector, energiaMecanica,calcularExcentricidade,  convertVelocityUAYearToPixelsSec,
    acceleration,accrk2mid, attaRK4, Camera, applyCameraTransform, scale, offsetX, offsetY,

} from "./funcoes.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let tempo = 0
// 1 UA = 200 pixels
const UA_TO_PIXELS = 1000;
const G = 39.48;
//const dt = 0.0009;
const dt = 0.0019;
// Sistema solar centralizado
const sol = new Ball(2, 1, 20, 1);
sol.vel = new Vector(0,0);
sol.cor = "yellow";

const terra = new Ball(2+1, 1, 15, 3e-6);
terra.cor = "blue";
let vterra = convertVelocityUAYearToPixelsSec(6.28, UA_TO_PIXELS);
console.log("vterra", vterra);
terra.vel = new Vector(0, 6.28);

const lua = new Ball(2+1 + 0.0026, 1, 3, 3.7e-8);
let vlua = convertVelocityUAYearToPixelsSec(0.21, UA_TO_PIXELS);
lua.vel = new Vector(0, 6.28 + 0.21);
lua.cor = "red";
let mercurio = new Ball(2+ 0.39, 1, 9, 1e-7);
mercurio.vel = new Vector(0, 10.21);
mercurio.cor ="red";
let venus = new Ball(2 + 0.72, 1, 9, 2.45e-6);
venus.vel = new Vector(0, 7.29);
venus.cor = "gray";
let jupter = new Ball(2 + 5.2, 1, 10, 9.55e-4);
jupter.vel = new Vector(0, 2.75);
jupter.cor = "brown";
let saturno = new Ball(2 + 9.58, 1, 10, 2.86e-4);
saturno.vel = new Vector(0, 2.03);
saturno.cor = "brown";
let urano = new Ball(2 + 19.2, 1, 10, 4.37e-5);
urano.vel = new Vector(0, 1.44);
urano.cor = "brown";
let marte = new Ball(2 + 1.52, 1, 10, 3.23e-7);
marte.vel = new Vector(0, 5.08);
marte.cor = "brown";
let netuno = new Ball(2 + 30, 1, 10, 5.15e-5);
netuno.vel = new Vector(0,  1.15);
netuno.cor = "brown";


Camera(canvas);

function addTrail() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

let stars = [];
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

// E garanta que estas variáveis estão disponíveis (elas já devem estar no seu loop)
let showTrails = true;

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

function loop() {
    // Limpa o canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1️⃣ DESENHA AS ESTRELAS PRIMEIRO (sem transformação de câmera)
    desenharEstrelas();

    // 2️⃣ APLICA A TRANSFORMAÇÃO DA CÂMERA
    applyCameraTransform(ctx);

    // 3️⃣ ATUALIZA E DESENHA OS PLANETAS (com transformação de câmera)
    attaRK4(dt, BALLZ, G);

    for(let b of BALLZ) {
        b.desenharBola(UA_TO_PIXELS, 4);
        if (showTrails) {
            b.desenharRastro(UA_TO_PIXELS);
        }
    }

    // 4️⃣ INTERFACE (sem transformação de câmera)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    desenharInterface();
    
    requestAnimationFrame(loop);
}
loop();