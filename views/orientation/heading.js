let hAxis = {
    h:0
}

let hDelta = {
    h:0
}

function updateHeading(h) {
    hDelta.h = h - hAxis.h
    hAxis.h += hDelta.h


    updateHeadingDisplay(h)
}

function updateHeadingDisplay(h) {
    const dispH = document.getElementById("heading");

    dispH.innerHTML = `h: ${h}`
}