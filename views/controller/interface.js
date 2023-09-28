let WIDTH =1000
let HEIGHT = 800

angle = 0
speed = 0

let dispAng 
let dispSpe

let multiAng = 1
let multiSpeed = 200

let sendValues = {}

function setup() {
    dispAng = document.getElementById("angle")
    dispSpe = document.getElementById("speed")
    createCanvas(WIDTH, HEIGHT);
    stroke(51);
    strokeWeight(5);
}
  
function draw() {
    background(220);
    
    push()
        translate(WIDTH/2, HEIGHT/2)
        let x = (Math.cos(angle)*speed)*multiSpeed
        let y = -(Math.sin(angle)*speed)*multiSpeed

        line(0,0,x,y)
        circle(x,y, 10)

        if(controllers[0]){
            update();
        }
    pop()
}
  

function update () {
    let xAxis = controllers[0].axes[0]
    let yAxis = -controllers[0].axes[1]
    
    angle = Math.atan2(yAxis,xAxis)
    speed = Math.hypot(xAxis,yAxis)
    

    if (speed > 1){
        speed = 1 
    }
    if (speed < -1){
        speed = -1 
    }

    sendValues.speed = speed      
    dispSpe.innerText = speed

    sendValues.angle = angle*(180/Math.PI)
    dispAng.innerText = angle*(180/Math.PI)

    socket.emit('drive-control', sendValues)
}