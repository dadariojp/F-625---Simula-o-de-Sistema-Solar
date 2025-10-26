const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export let scale = 0.3;
const zoomFactor = 1.1; //NUNCA COLOCAR 1, qualquer outro numero funciona

window.offsetX = 0;
window.offsetY = 0;
export let offsetX = 0;
export let offsetY = 0;

export function Camera(canvas) {
    let isDragging = false;
    let startX, startY;

    // Configurar scale inicial
    scale = 0.3; // SEU VALOR DESEJADO

    // CENTRALIZAR NO SOL considerando o scale
    const SOL_X = 2;
    const SOL_Y = 1;
    const UA_TO_PIXELS = 1000;
    
    offsetX = canvas.width / 2 - SOL_X * UA_TO_PIXELS * scale;
    offsetY = canvas.height / 2 - SOL_Y * UA_TO_PIXELS * scale;

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            offsetX = e.clientX - startX;
            offsetY = e.clientY - startY;
        }
    });

    window.addEventListener('mouseup', () => { isDragging = false; });
    
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - offsetX) / scale;
        const mouseY = (e.clientY - rect.top - offsetY) / scale;

        const zoomAmount = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
        scale *= zoomAmount;

        offsetX = e.clientX - rect.left - mouseX * scale;
        offsetY = e.clientY - rect.top - mouseY * scale;
    });
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
        this.mass = m
        this.cor = "yellow";
        BALLZ.push(this);
        this.trail = [];
    }
    desenharBola(UAtoPX, raioPX = null) {
    const px = this.pos.x * UAtoPX;
    const py = this.pos.y * UAtoPX;
    const raio = this.r;

    // Gradiente para o Sol
    if (this.cor === "yellow" || this.cor === "#FFD700") {
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, raio);
        gradient.addColorStop(0, "#FFFF00");
        gradient.addColorStop(0.7, "#FFA500");
        gradient.addColorStop(1, "#FF4500");
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = this.cor;
    }
    
    ctx.beginPath();
    ctx.arc(px, py, raio, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}
    desenharRastro(UAtoPX) {
    this.trail.push({x: this.pos.x, y: this.pos.y});
    if (this.trail.length > 200) this.trail.shift(); // Controla comprimento

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
};

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

