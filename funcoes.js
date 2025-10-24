const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


export let scale = 1;
const zoomFactor = 1.1; //NUNCA COLOCAR 1, qualquer outro numero funciona

window.offsetX = 0;
window.offsetY = 0;
export let offsetX = 0;
export let offsetY = 0;

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

export function acceleration(ball, balls, G, dt, v){ 
    let acc = new Vector(0,0); 
    for (let b of balls){ 
    if (b === ball) continue; 
    let newpos = new Vector(0,0); 
    newpos = newpos.sum(ball.pos).sum(v.ProdutoEscalar(dt)) 
    let rvec = ball.pos.subtr(b.pos); let rversor = rvec.unit(); 
    let ForceMag = -1*(b.mass*G)/((rvec.mag())**2 + 1e-6); 
    acc = acc.sum(rversor.ProdutoEscalar(ForceMag)); 

}; 
return acc 
};




export function attaRK4(dt,balls,G){ 
    for(let i = 0; i <= balls.length - 1; i++){ 
    let dx = new Vector(0,0); let a_xn = new Vector(0,0); 
    a_xn = a_xn.sum(acceleration(balls[i], balls, G, 0, balls[i].vel)); 
    dx = dx.sum(balls[i].vel.ProdutoEscalar(dt)).sum(a_xn.ProdutoEscalar((dt**2)/2)); 
    let a_xnup = new Vector(0,0); 
    a_xnup = a_xnup.sum(acceleration(balls[i], balls, G, 0, balls[i].vel)) 
    let dv = new Vector(0,0); 
    dv = dv.sum(a_xn).sum(a_xnup).ProdutoEscalar(dt/2); 
    balls[i].pos = balls[i].pos.sum(dx); balls[i].vel = balls[i].vel.sum(dv); 

}; 
};