function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    textSize(width / 3);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
}

let displayVal = 0;

function draw() {
    background(255);
    normalMaterial();
    translate(-240, -100,0);
    angleMode(DEGREES)

    push()
    rotateY(displayVal-hAxis.h)
    displayVal = hAxis.h
    // rotateX(gDelta.x)
    // rotateZ(gDelta.z)
    box( 180, 30, 180)
    pop()
}