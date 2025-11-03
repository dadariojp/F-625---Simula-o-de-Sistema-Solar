const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== Configuracoes Globais === //
const zoomFactor = 1.1; 
window.offsetX = 0;
window.offsetY = 0;
let scale = 0.3;

// ===== Variaveis de Estado 
window.planetaSeguido = null;
window.planetaSelecionado = null;


// ===== Elementos do painel Interativo === //
const painelPlaneta = document.createElement("div");
painelPlaneta.id = "painelPlaneta";
painelPlaneta.style.position = "absolute";
painelPlaneta.style.top = "20px";
painelPlaneta.style.right = "20px";
painelPlaneta.style.background = "rgba(0, 0, 0, 0.95)";
painelPlaneta.style.color = "white";
painelPlaneta.style.padding = "15px";
painelPlaneta.style.borderRadius = "10px";
painelPlaneta.style.fontFamily = "Arial, sans-serif";
painelPlaneta.style.fontSize = "14px";
painelPlaneta.style.width = "300px";
painelPlaneta.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.8)";
painelPlaneta.style.zIndex = "10000";
painelPlaneta.style.border = "2px solid rgba(255, 255, 255, 0.3)";
painelPlaneta.style.display = "none";
painelPlaneta.style.backdropFilter = "blur(5px)";
painelPlaneta.style.opacity = "1";
painelPlaneta.style.visibility = "visible";
document.body.appendChild(painelPlaneta);


// ===== Controle de Camera com conversão de Unidades Astronomicas (UA) para pixel
export function Camera(canvas, UA_TO_PIXELS) { 
    let isDragging = false;
    let startX, startY;

    // Configuração inicial
    scale = 0.08;
    offsetX = canvas.width / 2 - 2 * UA_TO_PIXELS * scale;
    offsetY = canvas.height / 2 - 1 * UA_TO_PIXELS * scale;

    canvas.addEventListener('click', (e) => {
        if (isDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldX = (mouseX - offsetX) / scale;
        const worldY = (mouseY - offsetY) / scale;
        
        // Margem de erro pro clique do planeta
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
                window.planetaSelecionado = planeta;
                console.log(`Seguindo: ${planeta.name}`);
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
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
}




// ===== Classes Principais (Vetor, Bola) ===== //
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
    constructor(x,y,r, m, nome = 'name',densidade='d',numerodesatelites='ns', numerodeaneis ='nda', classificação='tdpl' ){
        this.tdpl=classificação
        this.nda=numerodeaneis 
        this.ns = numerodesatelites
        this.d = densidade
        this.name = nome 
        this.clicado = false
        this.pos = new Vector(x,y);
        this.vel = new Vector(0,0);
        this.acc = new Vector(0,0);
        this.r = r;
        this.mass = m
        this.cor = "yellow";
        BALLZ.push(this);
        this.trail = [];
        this.lastAngle = null;         
        this.angleAccumulator = 0;     
        this.orbitStartTime = null;    
        this.period = null;
        this.periododeorbita = 'calculando'
        this.image = new Image();
        this.imagemCarregada = false;
        this.usarImagem = false;
    }
    carregarImagem(caminho) {
        this.image.src = caminho;
        this.usarImagem = true;
        
        this.image.onload = () => {
            console.log(`Imagem de ${this.name} carregada com sucesso!`);
            this.imagemCarregada = true;
        };
        this.image.onerror = () => {
            console.error(`Erro ao carregar imagem: ${caminho}`);
            this.imagemCarregada = false;
            this.usarImagem = false;
        };
    }
    desenharPainel(){
        if (this.clicado === true){
        const painel = document.createElement("div");
        painel.id = "painelInfo";
        painel.style.position = "absolute";
        painel.style.top = "5px";
        painel.style.right = "5px";
        painel.style.background = "rgba(4, 2, 34, 0.8)";
        painel.style.color = "white";
        painel.style.padding = "10px";
        painel.style.borderRadius = "8px";
        painel.style.display = "none";
        painel.style.fontFamily = "monospace";
        painel.style.fontSize="14px";
        painel.style.width="260px";
        painel.style.boxshadow="0 0 10px rgba(255, 255, 255, 0.3)";
        document.body.appendChild(painel);
        painel.style.display = "block";
        painel.innerHTML = `
    <h3 style="margin-top:0;"> ${this.name}</h3>
    <p><b>Posição(em UA):</b> (${this.pos.x.toFixed(3)}, ${this.pos.y.toFixed(3)})</p>
    <p><b>Velocidade(UA/ano):</b> (${this.vel.x.toFixed(5)}, ${this.vel.y.toFixed(5)})</p>
    <hr style="border-color:#444;">
    <p><b>Massa(em massas solares):</b> ${this.mass.toExponential(3)} </p>
    <p><b>Período de órbita (em anos): </b> ${this.period}</p>
    <p><b>Densidade(em g/cm^3): </b> ${this.d}</p>
    <p><b>Número de satélites: </b>${this.ns} </p>
    <p><b>Temperatura média na superficie a 1bar(em K): </b>${this.nda}</p>
    <p><b>Classificação: </b>${this.tdpl}</p>
    
    
    <hr style="border-color:#444;">
    `
        }
};
    desenharBola(UAtoPX, raioPX = null) {
        const px = this.pos.x * UAtoPX;
        const py = this.pos.y * UAtoPX;
        const raio = this.r;

        // Tenta usar a imagem se estiver disponível
        if (this.usarImagem && this.imagemCarregada && this.image.complete && this.image.naturalWidth > 0) {
            ctx.drawImage(
                this.image,
                px - raio,
                py - raio,
                raio * 2,
                raio * 2
            );
        } else {
            // Fallback para o círculo colorido
            ctx.beginPath();
            ctx.arc(px, py, raio, 0, Math.PI * 2);
            ctx.fillStyle = this.cor;
            ctx.fill();
            ctx.closePath();
        }
    }
    desenharRastro(UAtoPX) {
    if (this.period === null) {
        // Ainda não completou uma órbita, continua acumulando
        this.trail.push({x: this.pos.x, y: this.pos.y});
    } else {
        // Já completou uma órbita, mantém apenas pontos equivalentes a 1 período
        const pontosPorPeriodo = Math.min(this.trail.length, 8000);
        this.trail = this.trail.slice(-pontosPorPeriodo);
    }
    
    if (this.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x * UAtoPX, this.trail[0].y * UAtoPX);
        for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x * UAtoPX, this.trail[i].y * UAtoPX);
        }
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "white";
        
        //width proporcional ao zoom (scale)
        ctx.lineWidth = Math.max(0.5, 2 / scale); // Mínimo de 0.5, máximo relativo ao zoom
        
        ctx.stroke();
        ctx.setLineDash([]);
    }
}
};




// ===== Fisica e Calculos ===== //

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
};


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

// === Função para detectar clique em um planeta ===
function planetaClicado(x, y, UAtoPX) {
  for (const p of BALLZ) {
    // Converte posição do planeta para pixels e aplica câmera
    const px = p.pos.x * UAtoPX * scale + offsetX;
    const py = p.pos.y * UAtoPX * scale + offsetY;

    // Distância do clique até o planeta
    const dx = x - px;
    const dy = y - py;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10+p.r * scale) {for (const b of BALLZ){
        if (b.clicado===true) {b.clicado=false}
    } 
        p.clicado = true};
  }
  return null;
}


// === Função para mostrar informações ===
export function atualizarPainelPlaneta() {

    if (!window.planetaSelecionado) {
        painelPlaneta.style.display = "none";
        return;
    }
    
    const p = window.planetaSelecionado;

    
    painelPlaneta.style.display = "block";
    painelPlaneta.innerHTML = `
        <h3>${p.name}</h3>
        <p><b>Posição:</b> (${p.pos.x.toFixed(3)}, ${p.pos.y.toFixed(3)}) UA</p>
        <p><b>Velocidade:</b> (${p.vel.x.toFixed(5)}, ${p.vel.y.toFixed(5)}) UA/ano</p>
        <p><b>Massa:</b> ${p.mass.toExponential(3)} M☉</p>
        <p><b>Período:</b> ${p.period || 'calculando'} anos</p>
        <p><b>Densidade:</b> ${p.d} g/cm³</p>
        <p><b>Satélites:</b> ${p.ns}</p>
        <p><b>Classificação:</b> ${p.tdpl}</p>
    `;
}

export function medirPeriodo(planeta, sol, tempo) {
    // Ignora o sol (não orbita nada)
    if (planeta === sol) return;
    
    // vetor relativo Sol -> planeta
    const dx = planeta.pos.x - sol.pos.x;
    const dy = planeta.pos.y - sol.pos.y;
    
    // ângulo atual (radians)
    let ang = Math.atan2(dy, dx);
    
    // inicialização
    if (planeta.lastAngle === null) {
        planeta.lastAngle = ang;
        planeta.orbitStartTime = tempo;
        planeta.angleAccumulator = 0;
        return;
    }
    
    // diferença de ângulo desde a última medida
    let deltaAng = ang - planeta.lastAngle;
    
    // Ajuste para passagem pelo ângulo -π/π
    if (deltaAng > Math.PI) {
        deltaAng -= 2 * Math.PI;
    } else if (deltaAng < -Math.PI) {
        deltaAng += 2 * Math.PI;
    }
    
    // Acumula a variação do ângulo
    planeta.angleAccumulator += Math.abs(deltaAng);
    
    // Se acumulou uma volta completa (2π), calcula o período
    if (planeta.angleAccumulator >= 2 * Math.PI) {
        planeta.period = tempo - planeta.orbitStartTime;
        planeta.angleAccumulator = 0;
        planeta.orbitStartTime = tempo;
        console.log(`📅 Período de ${planeta.name}: ${planeta.period.toFixed(2)} anos`);
    }
    
    // Atualiza o último ângulo
    planeta.lastAngle = ang;
}

