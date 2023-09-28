const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

let sampler = 0;

const PORT = 3000;

let turretBoundaries={
  pitch:  {h:0.25, l:0.129},
  yaw:    {h:0.25,  l:0.06}
}

let turretPosition = {
  pitch:  0.2,
  yaw:    0.2
}

function exec () {
  io.on("connection", (socket) => {
    socket.on("ID", id => {
      console.log("CONNECTION: ", id)
    })

    socket.on("drive-control", data=>{
      io.emit("drive-orders", data.angle, data.speed)
    })

  });
  
  require("./routes/router")(app);

  httpServer.listen(PORT, ()=>{
    const ip = require("../helper").getHostIp();
    console.log(`http://${ip}:${PORT}`)
  });
}
// exec();

module.exports = exec;
