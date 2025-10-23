const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

    }
    desenharBola(){
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.cor;
    ctx.fill();
    ctx.closePath();
        
    }
    
};

export function acceleration(others, G, dt){
        let posicoes = [];
        let aceleracoes = []
        let tpasso = dt*0.5
        for (let i = 0; i <= others.length - 1; i++){
            
            let kvec = new Vector(0,0);
            
            kvec = kvec.sum(others[i].pos)
            

            posicoes.push(kvec);
        }
        
        for (let i = 0; i <= others.length - 1; i++){
            let acc = new Vector(0,0);
            for (let j = 0; j <= others.length - 1; j++){
                if (j === i) continue;
                let rvec = posicoes[j].subtr(posicoes[i]);
                let rversor = rvec.unit();
                
                let ForceMag = (others[j].mass*G)/((rvec.mag())**2 + 1e-6);
                
                acc = acc.sum(rversor.ProdutoEscalar(ForceMag));
                
                
            }
            aceleracoes.push(acc);
            
        }
        
        
        return aceleracoes
};




export function attaRK4(dt,balls,G){
    let leap = dt*dt*0.5;
    let a_n = acceleration(balls, G, dt)
    for(let i = 0; i <= balls.length - 1; i++){
        balls[i].pos = balls[i].pos.sum(balls[i].vel.ProdutoEscalar(dt)).sum(a_n[i].ProdutoEscalar(leap));
    };
    let a_n1 = acceleration(balls, G, dt);
    for(let i = 0; i <= balls.length - 1; i++){
        balls[i].vel = balls[i].vel.sum((a_n[i].sum(a_n1[i]).ProdutoEscalar(dt*0.5)));
    };  

};