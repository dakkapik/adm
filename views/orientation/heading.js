let hAxis = {
    h:0
}

function updateHeading(h) {
    console.log(h)
    hAxis.h = h
    updateHeadingDisplay(h)
}

function updateHeadingDisplay(h) {
    const dispH = document.getElementById("heading");

    dispH.innerHTML = `h: ${h}`
}