import { BALLZ, Ball, Vector, energiaMecanica,  acceleration,accrk2mid, attaRK4, Camera, applyCameraTransform, scale} from "./funcoes.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const G =1;
const dt = 5;
const sol = new Ball(0, 0, 40, 10000);
sol.vel = new Vector(0,0);
sol.cor = "yellow";
const terra = new  Ball(30,  440, 20, 1);
terra.cor = "blue";
terra.vel = new Vector(0, 1);
const lua = new Ball(0, 440, 10, 0.1);
lua.vel = new Vector(0, 0.8);
lua.cor = "red";
let planeta1 = new Ball(3000, 440, 10, 0.8);
planeta1.vel = new Vector(0, 1);



//----------Funçōes--------//


function addTrail() {  //adiciona o "fade", se diminuir muito a opacidade fica marcado onde ele passou
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";   //mudem o ultimo parametro pra voces entenderem a opacidade
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

Camera(canvas);


function loop(){    //loop que faz a animação

    //addTrail()  //ativa a funcao rastro que é mais um fade


    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);  //COMENTE ESSA LINHA PARA O addTrail FUNCIONAR

    applyCameraTransform(ctx)

    attaRK4(dt,BALLZ, G);  //add a fisica

    for(let b of BALLZ){ 
    b.desenharBola()
    b.desenharRastro()
    }
    
    let energiamecanica = energiaMecanica(BALLZ, G);
    
    console.log("energiamecanica", energiamecanica);
        requestAnimationFrame(loop);
}   
loop();
