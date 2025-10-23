import { BALLZ, Ball, Vector, acceleration, attaRK4 } from "./funcoes.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const G =1;
const dt = 0.5;
const sol = new Ball(660, 440, 40, 100000);
sol.vel = new Vector(0,0);
const terra = new  Ball( 300,  440, 5, 100);
terra.cor = "blue";
terra.vel = new Vector(0, -17);
const lua = new  Ball( 295,  440, 1, 1);
lua.vel = new Vector(0, -13);
lua.cor= "white"
let planeta1 = new Ball(500, 440, 4, 100);
planeta1.vel = new Vector(0, -20);
planeta1.cor = "red"
let planeta2 = new Ball(150, 440, 10, 1000);
planeta2.vel = new Vector(0, -20);
planeta2.cor = "red"

function addTrail() {
    
    ctx.fillStyle = "rgba(3, 3, 3, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function loop(){
    addTrail()  //add a funcao rastro

    attaRK4(dt,BALLZ, G);  //add a fisica
    for(let b of BALLZ){ 
    b.desenharBola()
    }
    
    console.log(terra.vel)
   
        requestAnimationFrame(loop);
   
   

}
loop();