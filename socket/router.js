module.exports = (app) => {
    const path = require("path")

    app.get("/", (req, res)=> {
        res.sendFile(path.resolve(__dirname + '/../views/index.html'))
    })

    app.get("/mouse-control", (req, res)=> {
        res.sendFile(path.resolve(__dirname + '/../views/mouse-control.html'))
    })

    app.get("/gyro", (req, res)=> {
        res.sendFile(path.resolve(__dirname + '/../views/gyro-display.html'))
    })
}