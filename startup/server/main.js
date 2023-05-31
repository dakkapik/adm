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
    console.log("connection")
    socket.on("ID", id => {
      console.log("CONNECTION: ", id)
    })

    socket.on("orientation", (data)=> {
      
      let filterR = Buffer.from(data).toString().split("\r")[0]
      let stringVal = filterR.split(",");
      
      const rawValues = [];
      stringVal.forEach(val => {
        rawValues.push(parseFloat(val))
      })

      io.emit("raw-values", {x: rawValues[0], y: rawValues[1],z: rawValues[2]},{x: rawValues[3], y: rawValues[4],z: rawValues[5]},{x: rawValues[6], y: rawValues[7],z: rawValues[8]});
      
      const turret = [
        (((rawValues[0]+90)/640)+0.02).toPrecision(5), 
        (((rawValues[1]+90)/640)+0.02).toPrecision(5),
        (rawValues[2]).toPrecision(5)
      ];
  
      // console.log(coords);
      // console.log(test);
      io.emit("magnet",stringVal[3],stringVal[4],stringVal[5]);


      io.emit("gyro-output", turret[0], turret[1], turret[2]);
    })
    socket.on("test-order", value =>{
      socket.emit("test-order", value)
    })
    socket.on("mouse-pos", (pitch, yaw)=> {
      // if( 
      //   pitch < turretBoundaries.pitch.h && 
      //   pitch > turretBoundaries.pitch.l) {
        turretPosition.pitch = pitch;
      // }
      // if(yaw < turretBoundaries.yaw.h && 
      //   yaw > turretBoundaries.yaw.l ){
        turretPosition.yaw = yaw;
      // }
      io.emit("mouse-order", turretPosition.pitch
      // ,0, turretPosition.yaw
      );
      console.log(turretPosition)
    })

    socket.on("manual-control", (pitch, yaw)=> {
      if( 
        turretPosition.pitch + pitch < turretBoundaries.pitch.h && 
        turretPosition.pitch + pitch > turretBoundaries.pitch.l) {
        turretPosition.pitch += pitch;
      }
      if(turretPosition.yaw + yaw < turretBoundaries.pitch.h && 
        turretPosition.yaw + yaw > turretBoundaries.pitch.l ){
        turretPosition.yaw += yaw;
      }
      io.emit("gyro-output", 0,turretPosition.pitch, turretPosition.yaw);
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
