const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


export let scale = 0.5;
const zoomFactor = 1.1; //NUNCA COLOCAR 1, qualquer outro numero funciona

export let offsetX = canvas.width / 2; 
export let offsetY = canvas.height / 2;

export function Camera(canvas) {
    let isDragging = false;
    let startX, startY;

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
    desenharRastro() {  
        this.trail.push({x: this.pos.x, y: this.pos.y}); 
        if (this.trail.length > 500) this.trail.shift(); 

        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.setLineDash([5,5]);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    desenharBola(){
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.cor;
    ctx.fill();
    ctx.closePath();
        
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


export function attaRK4(dt, balls, G) {
    // 1️⃣ Copia o estado inicial (posições e velocidades)
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