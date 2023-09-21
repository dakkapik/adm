const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
const PORT = 3000;

const ROOM_DISCRETE   ='ROOM_DISCRETE' 
const ROOM_INTEGRATED ='ROOM_INTEGRATED' 
const ROOM_EMITTER    ='ROOM_EMITTER'

const EMIT_DISCRETE   = 'emit_discrete' 
const EMIT_INTEGRATED = 'emit_integrated'

const DISPLAY_INTEGRATED  =  'DISPLAY_INTEGRATED'
const DISPLAY_DISCRETE    =  'DISPLAY_DISCRETE'
const EMITTER_PI          =  'EMITTER_PI'

function checkRoomJoin(id, socket) {
  console.log(id)
  switch(id){
    case DISPLAY_INTEGRATED:
      console.log("CONNECTION: ", id, '==>', ROOM_INTEGRATED)
      socket.join(ROOM_INTEGRATED)
      io.to(ROOM_EMITTER).emit(EMIT_INTEGRATED, true)
    break;

    case DISPLAY_DISCRETE:
      console.log("CONNECTION: ", id, '==>',ROOM_DISCRETE)
      socket.join(ROOM_DISCRETE)
      io.to(ROOM_EMITTER).emit(EMIT_DISCRETE, true)
    break;

    case EMITTER_PI:
      console.log("CONNECTION: ", id, '==>',ROOM_EMITTER)
      socket.join(ROOM_EMITTER)
    break;

    default:
      console.log("CONNECTION: ", id)
    break;
  };
}

function exec () {
  io.on("connection", (socket) => {
    socket.on("ID", (id) => {
      checkRoomJoin(id, socket)
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

    socket.on('pi-discrete', (g, a, m,t,c,o) => {
      io.emit('py-data', g,a,m,t,c,o)
    })

    // get inertial setup if listner active
    socket.on("py-mpu", (g, a, m,t,c,o) => {
      
      io.emit('py-data', g,a,m,t,c,o)
    })
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

    socket.on("disconnect", async (reason, desc) => {
      // const emiRo = await io.in(EMITTER_ROOM).fetchSockets()
      const disRo = await io.in(ROOM_DISCRETE).fetchSockets()
      const intRo = await io.in(ROOM_INTEGRATED).fetchSockets()

      if(disRo.length ===0) io.to(ROOM_EMITTER).emit(EMIT_DISCRETE, false)
      if(intRo.length ===0) io.to(ROOM_EMITTER).emit(EMIT_INTEGRATED, false)

      console.log("DISCONNECT: ", reason)
    })

  });
  
  require("./routes/router")(app);

  httpServer.listen(PORT, ()=>{
    const ip = require("../helper").getHostIp();
    console.log(`http://${ip}:${PORT}`)
  });
}

module.exports = exec;
