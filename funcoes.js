const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const zoomFactor = 1.1; //NUNCA COLOCAR 1, qualquer outro numero funciona

window.offsetX = 0;
window.offsetY = 0;
export let brilho = 0;
let scale = 0.3;
export function setOffset(x, y) {
    offsetX = x;
    offsetY = y;
}
export function getOffset() {
    return { offsetX, offsetY };
}
export function setScale(newScale) {
    scale = newScale;
}
export function getScale() {
    return scale;
}

export function Camera(canvas, UA_TO_PIXELS) { // Adicione UA_TO_PIXELS como parâmetro
    let isDragging = false;
    let startX, startY;
    window.planetaSeguido = null;

    // Configuração inicial
    scale = 0.3;
    offsetX = canvas.width / 2 - 2 * UA_TO_PIXELS * scale;
    offsetY = canvas.height / 2 - 1 * UA_TO_PIXELS * scale;

    // Evento de clique para focar nos planetas
    canvas.addEventListener('click', (e) => {
        if (isDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Converter coordenadas
        const worldX = (mouseX - offsetX) / scale;
        const worldY = (mouseY - offsetY) / scale;
        
        // Verificar colisão com planetas
        for (const planeta of BALLZ) {
            const px = planeta.pos.x * UA_TO_PIXELS;
            const py = planeta.pos.y * UA_TO_PIXELS;
            const distancia = Math.sqrt(
                Math.pow(worldX - px, 2) + 
                Math.pow(worldY - py, 2)
            );
            
            const margemClique = Math.max(planeta.r * 2, 15);
            
            if (distancia <= margemClique) {
                window.planetaSeguido = planeta;
                console.log(`Seguindo: ${planeta === sol ? 'Sol' : 'Planeta'}`);
                break;
            }
        }
    });

    // Eventos de arraste e zoom
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
        window.planetaSeguido = null;
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            offsetX = e.clientX - startX;
            offsetY = e.clientY - startY;
        }
    });

    window.addEventListener('mouseup', () => { 
        isDragging = false; 
    });
    
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        window.planetaSeguido = null;

        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - offsetX) / scale;
        const mouseY = (e.clientY - rect.top - offsetY) / scale;

        const zoomAmount = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
        scale *= zoomAmount;

        offsetX = e.clientX - rect.left - mouseX * scale;
        offsetY = e.clientY - rect.top - mouseY * scale;
    });

    // Função para atualizar a câmera
    function atualizarCamera() {
        if (window.planetaSeguido && !isDragging) {
            const px = window.planetaSeguido.pos.x * UA_TO_PIXELS;
            const py = window.planetaSeguido.pos.y * UA_TO_PIXELS;
            offsetX = canvas.width / 2 - px * scale;
            offsetY = canvas.height / 2 - py * scale;
        }
    }

    return atualizarCamera;
}
export function applyCameraTransform(ctx) {
    console.log("Camera transform:", scale, offsetX, offsetY);
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
}


export  const BALLZ = []
export class Vector{
    constructor(x,y){
    this.x = x;
    this.y = y;

    }
    
    sum(v2){
       return new Vector(this.x + v2.x, this.y + v2.y)
    }
    
    subtr(v2){
       return new Vector(this.x - v2.x, this.y - v2.y)
    }
    mag() {
    return Math.sqrt((this.x)**2 + (this.y)**2);
    }
    ProdutoEscalar(s) {
    return new Vector(this.x * s, this.y * s);
    }
    unit(){
        return new Vector(this.x/this.mag(), this.y/this.mag())
    }
}
export class Ball{
    constructor(x,y,r, m){
        this.pos = new Vector(x,y);
        this.vel = new Vector(0,0);
        this.acc = new Vector(0,0);
        this.r = r;
        this.mass = m;
        this.cor = "gray";
        this.aparencia = {
            tipo: 'solido',
            cor: this.cor,
            gradiente: null,
            brilho: {
                intensidade: 0,
                cor: '#FFFFFF',
                tamanho: 0
            },
            aneis: null
        };
        BALLZ.push(this);
        this.trail = [];
    }

    desenharBola(UAtoPX, raioPX = null) {
        const px = this.pos.x * UAtoPX;
        const py = this.pos.y * UAtoPX;
        const raio = raioPX || this.r;

        // 1º: Anéis (SE houver, desenhamos ATRÁS do planeta)
        if (this.aparencia.aneis) {
            this.desenharAneis(px, py, raio);
        }

        // 2º: Glow externo do planeta
        if (this.aparencia.brilho && this.aparencia.brilho.tamanho > 0) {
            this.desenharGlowExterno(px, py, raio);
        }

        // 3º: Planeta em si
        ctx.beginPath();
        ctx.arc(px, py, raio, 0, Math.PI * 2);
        
        if (this.aparencia.tipo === 'gradiente' && this.aparencia.gradiente) {
            this.aplicarGradiente(px, py, raio);
        } else {
            ctx.fillStyle = this.aparencia.cor || this.cor;
        }
        
        ctx.fill();
        ctx.closePath();

        // 4º: Brilho interno do planeta
        if (this.aparencia.brilho && this.aparencia.brilho.intensidade > 0) {
            this.desenharBrilhoInterno(px, py, raio);
        }
    }

    desenharGlowExterno(px, py, raio) {
        const brilho = this.aparencia.brilho;
        const gradient = ctx.createRadialGradient(
            px, py, raio,
            px, py, raio + brilho.tamanho
        );
        gradient.addColorStop(0, brilho.cor);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, raio + brilho.tamanho, 0, Math.PI * 2);
        ctx.fill();
    }

    desenharBrilhoInterno(px, py, raio) {
        const brilho = this.aparencia.brilho;
        ctx.globalAlpha = brilho.intensidade / 100;
        ctx.fillStyle = brilho.cor;
        ctx.beginPath();
        ctx.arc(px, py, raio, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    aplicarGradiente(px, py, raio) {
        const gradiente = ctx.createRadialGradient(
            px, py, 0,
            px, py, raio
        );
        this.aparencia.gradiente.cores.forEach((corInfo, index) => {
            const stop = index / (this.aparencia.gradiente.cores.length - 1);
            gradiente.addColorStop(stop, corInfo.cor);
        });
        ctx.fillStyle = gradiente;
    }

    desenharAneis(px, py, raio) {
    if (!this.aparencia.aneis) return;
    
    const aneis = this.aparencia.aneis;
    
    ctx.save();
    ctx.translate(px, py);
    
    // Apenas inclinação fixa, SEM rotação
    ctx.rotate(aneis.inclinacao || 0.5);
    
    const largura = aneis.largura || 15;
    const altura = raio * (aneis.alturaRelativa || 0.2);
    
    // Cria um padrão de listras com gradiente linear
    const gradient = ctx.createLinearGradient(
        -raio - largura, 0,
        raio + largura, 0
    );
    
    // Adiciona múltiplas faixas de cores para criar o efeito de listras
    if (aneis.listras) {
        // Usa as cores definidas para as listras
        aneis.listras.forEach((listra, index) => {
            const posicao = index / aneis.listras.length;
            gradient.addColorStop(posicao, listra.cor);
        });
    } else {
        // Fallback: padrão de listras claro/escuro
        gradient.addColorStop(0, 'rgba(245, 222, 179, 0.9)');
        gradient.addColorStop(0.2, 'rgba(210, 180, 140, 0.7)');
        gradient.addColorStop(0.4, 'rgba(245, 222, 179, 0.8)');
        gradient.addColorStop(0.6, 'rgba(210, 180, 140, 0.6)');
        gradient.addColorStop(0.8, 'rgba(245, 222, 179, 0.7)');
        gradient.addColorStop(1, 'rgba(210, 180, 140, 0.5)');
    }
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = aneis.opacidade || 0.7;
    
    // Desenha o anel como uma elipse
    ctx.beginPath();
    ctx.ellipse(0, 0, raio + largura, altura, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}
    desenharRastro(UAtoPX) {
        this.trail.push({x: this.pos.x, y: this.pos.y});
        if (this.trail.length > 200) this.trail.shift();

        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x * UAtoPX, this.trail[0].y * UAtoPX);
            
            // Gradiente para o rastro
            const gradient = ctx.createLinearGradient(
                this.trail[0].x * UAtoPX, this.trail[0].y * UAtoPX,
                this.trail[this.trail.length-1].x * UAtoPX, this.trail[this.trail.length-1].y * UAtoPX
            );
            gradient.addColorStop(0, "rgba(255,255,255,0.8)");
            gradient.addColorStop(1, "rgba(255,255,255,0.1)");
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x * UAtoPX, this.trail[i].y * UAtoPX);
            }
            ctx.stroke();
        }
    }
}

export function acceleration(ball, balls, G){ 
    let acc = new Vector(0,0); 
    for (let b of balls){ 
    if (b === ball) continue; 
    let newpos = new Vector(0,0); 
    newpos = newpos.sum(ball.pos)
    let rvec = b.pos.subtr(ball.pos);
    let rversor = rvec.unit(); 
    let ForceMag = (b.mass*G)/((rvec.mag())**2 + 1e-6); 
    acc = acc.sum(rversor.ProdutoEscalar(ForceMag)); 

}; 
return acc 
};


export function accrk2mid(posicoesintermediarias, ball, balls, j, G){
    let acc = new Vector(0,0);
    for(let i = 0; i <= balls.length - 1; i++){
        if (balls[i] === ball) continue;
        let newpos = new Vector(0,0);
        newpos = newpos.sum(posicoesintermediarias[j]);
        let rvec = posicoesintermediarias[i].subtr(newpos);
        let rversor = rvec.unit();
        let ForceMag = (balls[i].mass*G)/((rvec.mag())**2 + 1e-6);
        acc = acc.sum(rversor.ProdutoEscalar(ForceMag));

    }
    return acc 
}


export function energiaMecanica(balls, G) {
    let energiaCin = 0;
    let energiaPot = 0;

    // Energia cinética
    for (let b of balls) {
        let v = b.vel.mag();
        energiaCin += 0.5 * b.mass * v * v;
    }

    // Energia potencial gravitacional (somente pares i<j)
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            let rvec = balls[i].pos.subtr(balls[j].pos);
            let r = rvec.mag();
            energiaPot += -G * balls[i].mass * balls[j].mass / (r + 1e-6);
        }
    }

    return energiaCin + energiaPot;
}


export function convertVelocityUAYearToPixelsSec(velocityUAYear, UA_TO_PIXELS) {
    
    const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60;
    const velocityUASec = velocityUAYear / SECONDS_PER_YEAR;
    
    
    const velocityPixelsSec = velocityUASec * UA_TO_PIXELS;
    
    return velocityPixelsSec;
}




export function calcularExcentricidade(planeta, sol, G) {
    // posição relativa
    const rx = planeta.pos.x - sol.pos.x;
    const ry = planeta.pos.y - sol.pos.y;
    const r = Math.hypot(rx, ry);

    // velocidade relativa
    const vx = planeta.vel.x - sol.vel.x;
    const vy = planeta.vel.y - sol.vel.y;

    // h = r × v  (em 2D vira pseudo-escalar)
    const h = rx * vy - ry * vx;

    const mu = G * (sol.mass + planeta.mass);

    // componente do vetor e
    const ex = (vy * h) / mu - (rx / r);
    const ey = (-vx * h) / mu - (ry / r);

    const e = Math.hypot(ex, ey); // módulo da excentricidade

    return e;
}





export function attaRK4(dt, balls, G) {
    // Copia o estado inicial (posições e velocidades)
    let pos0 = balls.map(b => new Vector(b.pos.x, b.pos.y));
    let vel0 = balls.map(b => new Vector(b.vel.x, b.vel.y));

    // --- k1 ---
    let a1 = balls.map(b => acceleration(b, balls, G));
    let k1r = vel0.map(v => v.ProdutoEscalar(dt));
    let k1v = a1.map(a => a.ProdutoEscalar(dt));

    // --- k2 ---
    let pos2 = pos0.map((p, i) => p.sum(k1r[i].ProdutoEscalar(0.5)));
    let vel2 = vel0.map((v, i) => v.sum(k1v[i].ProdutoEscalar(0.5)));

    // precisa de "falsas bolas" para calcular aceleração intermediária corretamente
    let balls_k2 = balls.map((b, i) => ({
        pos: pos2[i],
        vel: vel2[i],
        mass: b.mass
    }));

    let a2 = balls.map((b, i) => acceleration(balls_k2[i], balls_k2, G));
    let k2r = vel2.map(v => v.ProdutoEscalar(dt));
    let k2v = a2.map(a => a.ProdutoEscalar(dt));

    // --- k3 ---
    let pos3 = pos0.map((p, i) => p.sum(k2r[i].ProdutoEscalar(0.5)));
    let vel3 = vel0.map((v, i) => v.sum(k2v[i].ProdutoEscalar(0.5)));
    let balls_k3 = balls.map((b, i) => ({
        pos: pos3[i],
        vel: vel3[i],
        mass: b.mass
    }));

    let a3 = balls.map((b, i) => acceleration(balls_k3[i], balls_k3, G));
    let k3r = vel3.map(v => v.ProdutoEscalar(dt));
    let k3v = a3.map(a => a.ProdutoEscalar(dt));

    // --- k4 ---
    let pos4 = pos0.map((p, i) => p.sum(k3r[i]));
    let vel4 = vel0.map((v, i) => v.sum(k3v[i]));
    let balls_k4 = balls.map((b, i) => ({
        pos: pos4[i],
        vel: vel4[i],
        mass: b.mass
    }));

    let a4 = balls.map((b, i) => acceleration(balls_k4[i], balls_k4, G));
    let k4r = vel4.map(v => v.ProdutoEscalar(dt));
    let k4v = a4.map(a => a.ProdutoEscalar(dt));

    // --- Atualiza posição e velocidade finais ---
    for (let i = 0; i < balls.length; i++) {
        let deltaR = k1r[i]
            .sum(k2r[i].ProdutoEscalar(2))
            .sum(k3r[i].ProdutoEscalar(2))
            .sum(k4r[i])
            .ProdutoEscalar(1 / 6);

        let deltaV = k1v[i]
            .sum(k2v[i].ProdutoEscalar(2))
            .sum(k3v[i].ProdutoEscalar(2))
            .sum(k4v[i])
            .ProdutoEscalar(1 / 6);

        balls[i].pos = balls[i].pos.sum(deltaR);
        balls[i].vel = balls[i].vel.sum(deltaV);
    }
}

