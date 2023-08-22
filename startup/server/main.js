const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const { all } = require("express/lib/application");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
const PORT = 3000;

const DISCRETE_ROOM = 'DISCRETE_ROOM' 
const INTEGRATED_ROOM = 'INTEGRATED_ROOM' 
const EMITTER_ROOM = 'EMITTER_ROOM'

function checkRoomJoin(id) {
  if(id === 'integrated-display'){
    socket.join(INTEGRATED_ROOM)
    io.to(EMITTER_ROOM).emit('integration-on')
    console.log("CONNECTION: ", id)
    console.log("JOINED: ", INTEGRATED_ROOM)
    return 
  }
  if(id === 'discrete-display'){
    socket.join(DISCRETE_ROOM)
    io.to(EMITTER_ROOM).emit('discrete-on')
    console.log("CONNECTION: ", id)
    console.log("JOINED: ", DISCRETE_ROOM)
    return
  }
  if(id === 'emitter-pi'){
    socket.join(EMITTER_ROOM)
    console.log("CONNECTION: ", id)
    console.log("JOINED: ", EMITTER_ROOM)
    return
  }
  console.log("CONNECTION: ", id)
}

function exec () {
  io.on("connection", (socket) => {
    socket.on("ID", (id) => {
      checkRoomJoin(id)
    })

    socket.on("phone-sig", (data)=> {
      console.log("PHONE:", data)
    })
    
    socket.on("phone-order", (direction) => {
      if(direction === 'off'){
        io.emit("piTurnedOff")
      } else {
        io.emit("movePi", direction)
      }
    })

    // get inertial setup if listner active
    socket.on("py-mpu", (g, a, m,t,c,o) => io.emit('py-data', g,a,m,t,c,o))
    // get python raw data if listener set up
    // socket.on("py",)

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
  
    socket.on("mouse-pos", (pitch, yaw)=> {
      if( 
        pitch < turretBoundaries.pitch.h && 
        pitch > turretBoundaries.pitch.l) {
        turretPosition.pitch = pitch;
      }
      if(yaw < turretBoundaries.yaw.h && 
        yaw > turretBoundaries.yaw.l ){
        turretPosition.yaw = yaw;
      }
      io.emit("gyro-output", turretPosition.pitch,0, turretPosition.yaw);
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
