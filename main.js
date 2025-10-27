import { BALLZ, Ball, Vector, energiaMecanica,calcularExcentricidade,  convertVelocityUAYearToPixelsSec,
    acceleration,accrk2mid, attaRK4, Camera, applyCameraTransform, scale, offsetX, offsetY, brilho,
    setOffset, setScale, getOffset, getScale

} from "./funcoes.js";

let planetaFocado = null;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let tempo = 0
// 1 UA = 200 pixels
const UA_TO_PIXELS = 500;
const G = 39.48;
//const dt = 0.0009;
const dt = 0.00019;
// Sistema solar centralizado
const sol = new Ball(2, 1, 20, 1);
sol.vel = new Vector(0,0);
sol.aparencia.gradiente = {
    cores: [
        { cor: '#FFFF00' }, // Amarelo brilhante (núcleo)
        { cor: '#FFA500' }, // Laranja (fotosfera)
        { cor: '#FF4500' }, // Vermelho-laranja (cromosfera)
        { cor: '#8B0000' }  // Vermelho escuro (manchas solares)
    ]
};
sol.aparencia.brilho = {
    intensidade: 80,
    cor: '#FFFFAA',
    tamanho: 30
};

const terra = new Ball(2+1, 1, 6, 3e-6);
terra.cor = "blue";
let vterra = convertVelocityUAYearToPixelsSec(6.28, UA_TO_PIXELS);
console.log("vterra", vterra);
terra.vel = new Vector(0, 6.28);
terra.aparencia.tipo = 'gradiente';
terra.aparencia.gradiente = {
    cores: [
        { cor: '#87CEEB' },
        { cor: '#1E90FF' },
        { cor: '#32CD32' },
        { cor: '#8B4513' }
    ]
};


const lua = new Ball(2+1 + 0.0026, 1, 0.5, 3.7e-8);
let vlua = convertVelocityUAYearToPixelsSec(0.21, UA_TO_PIXELS);
lua.vel = new Vector(0, 6.28 + 0.21);
lua.aparencia.tipo = 'gradiente';
lua.aparencia.gradiente = {
    cores: [
        { cor: '#F5F5F5' },
        { cor: '#C0C0C0' },
        { cor: '#808080' },
        { cor: '#4A4A4A' }
    ]
};


let mercurio = new Ball(2+ 0.39, 1, 3, 1e-7);
mercurio.vel = new Vector(0, 10.21);
mercurio.aparencia.tipo = 'gradiente';
mercurio.aparencia.gradiente = {
    cores: [
        { cor: '#BEBEBE' },
        { cor: '#8C8C8C' },
        { cor: '#696969' },
        { cor: '#4F4F4F' }
    ]
};

let venus = new Ball(2 + 0.72, 1, 6, 2.45e-6);
venus.vel = new Vector(0, 7.29);
venus.aparencia.tipo = 'gradiente';
venus.aparencia.gradiente = {
    cores: [
        { cor: '#FFE4B5' },
        { cor: '#DEB887' },
        { cor: '#A0522D' },
        { cor: '#8B4513' }
    ]
};


let marte = new Ball(2 + 1.52, 1, 4, 3.23e-7);
marte.vel = new Vector(0, 5.08);
marte.aparencia.tipo = 'gradiente';
marte.aparencia.gradiente = {
    cores: [
        { cor: '#FF7F50' },
        { cor: '#CD5C5C' },
        { cor: '#8B0000' },
        { cor: '#8B4513' }
    ]
};

let jupter = new Ball(2 + 5.2, 1, 12, 9.55e-4);
jupter.vel = new Vector(0, 2.75);
jupter.aparencia.tipo = 'gradiente';
jupter.aparencia.gradiente = {
    cores: [
        { cor: '#F5DEB3' },
        { cor: '#DEB887' },
        { cor: '#A0522D' },
        { cor: '#8B4513' }
    ]
};


let saturno = new Ball(2 + 9.58, 1, 11, 2.86e-4);
saturno.vel = new Vector(0, 2.03);
saturno.aparencia.tipo = 'gradiente';
saturno.aparencia.gradiente = {
    cores: [
        { cor: '#F0E68C' },
        { cor: '#DAA520' },
        { cor: '#CD853F' },
        { cor: '#A0522D' }
    ]
};
saturno.aparencia.aneis = {
    largura: 18,
    alturaRelativa: 0.2,
    opacidade: 1,
    inclinacao: 0.5,
    // Padrão de listras alternadas
    listras: [
        { cor: 'rgba(245, 222, 179, 0.9)' }, // Dourado claro
        { cor: 'rgba(210, 180, 140, 0.7)' }, // Dourado médio
        { cor: 'rgba(184, 134, 11, 0.8)' },  // Dourado escuro
        { cor: 'rgba(210, 180, 140, 0.6)' }, // Dourado médio
        { cor: 'rgba(245, 222, 179, 0.9)' }, // Dourado claro
        { cor: 'rgba(184, 134, 11, 0.7)' },  // Dourado escuro
        { cor: 'rgba(210, 180, 140, 0.8)' }, // Dourado médio
        { cor: 'rgba(245, 222, 179, 0.9)' }  // Dourado claro
    ]
};
saturno.aparencia.brilho = {
    intensidade: 0,
    cor: '#DEB887',
    tamanho: 22
};


let urano = new Ball(2 + 19.2, 1, 8, 4.37e-5);
urano.vel = new Vector(0, 1.44);
urano.aparencia.tipo = 'gradiente';
urano.aparencia.gradiente = {
    cores: [
        { cor: '#B0E0E6' },
        { cor: '#87CEEB' },
        { cor: '#4682B4' },
        { cor: '#1E90FF' }
    ]
};


let netuno = new Ball(2 + 30, 1, 8, 5.15e-5);
netuno.vel = new Vector(0,  1.15);
netuno.aparencia.tipo = 'gradiente';
netuno.aparencia.gradiente = {
    cores: [
        { cor: '#1E90FF' },
        { cor: '#0000CD' },
        { cor: '#000080' },
        { cor: '#191970' }
    ]
};

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

const atualizarCamera = Camera(canvas);

function loop() {
    // Limpa o canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Atualiza a câmera (segue o planeta focado se houver)
    atualizarCamera();

    // 1️⃣ DESENHA AS ESTRELAS PRIMEIRO (sem transformação de câmera)
    desenharEstrelas();

    // 2️⃣ APLICA A TRANSFORMAÇÃO DA CÂMERA
    applyCameraTransform(ctx);

    // 3️⃣ ATUALIZA E DESENHA OS PLANETAS (com transformação de câmera)
    attaRK4(dt, BALLZ, G);

    for(let b of BALLZ) {
        b.desenharBola(UA_TO_PIXELS);
        if (showTrails) {
            b.desenharRastro(UA_TO_PIXELS);
        }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    desenharInterface();
    
    requestAnimationFrame(loop);
}

loop();

// Função para resetar a câmera no Sol
function resetarCamera() {
    scale = 0.3;
    offsetX = canvas.width / 2 - sol.pos.x * UA_TO_PIXELS * scale;
    offsetY = canvas.height / 2 - sol.pos.y * UA_TO_PIXELS * scale;
};