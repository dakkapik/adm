function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    textSize(width / 3);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
}


function draw() {
    background(255);
    normalMaterial();
    translate(-240, -100,0);
    angleMode(DEGREES)

    push()
    rotateY(hAxis.h)
    // rotateX(gDelta.x * 10)
    // rotateZ(gDelta.z * 2)
    box( 180, 30, 180)
    pop()
}