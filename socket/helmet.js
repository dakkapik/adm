const {io} = require("socket.io-client");
const { spawn, execSync } = require("child_process");

const ipAddresses = [
    "http://192.168.2.15:3000",
    "http://192.168.2.14:3000",
    "http://192.168.0.100:3000",
    "http://192.168.0.109:3000",
    "http://192.168.2.19:3000",
    "http://192.168.2.12:3000"
]
const sockets = []
let socket;

const helmet = (linux, sysname) => {
    console.log("connecting to server...")
    for(let i = 0; i < ipAddresses.length; i++) {
        sockets[i] = io(ipAddresses[i])
        sockets[i].on("connect", ()=> {
            socket = sockets[i];
            console.log("CONNECTION");
            flushSockets(i);
            exec();
        })
    }
}

helmet();

function flushSockets(exception) {
    console.log("FLUSHING SOCKETS")
    for(let i = 0; i < ipAddresses.length; i++) {
        if(i !== exception){
            sockets[i].close();
            sockets[i] = null;
        }
    }
}

const exec = async ()=>{
    
    console.log("running build...");

    await execSync('gcc gyro.cpp -lstdc++ -lwiringPi -lpthread -o exec -lm'
    // await execSync('gcc g.cpp -lstdc++ -lwiringPi -lpthread -o exec -lm'
    , {
        cwd: "../driver"
    }, (err, stdout, stderr) => {
        if(!err) {
            // change this, something better
            console.log('subprocess stdout: ', Buffer.from(stdout).toString())
            console.log('subprocess stderr: ', Buffer.from(stderr).toString())
            // resolve()
            
        } else {
            console.error("BUILD ERROR: ",err)
            // rejects("Subprocess error: ", err)
        }
    });

    console.log('\x1b[32m%s\x1b[0m', "running exec...");

    const child = spawn('./exec', [] ,{
        stdio: ['ignore', 'pipe', process.stderr],
        cwd: "../driver"
    });

    child.stdout.on("data", (data)=>{
        // console.log(data);
        socket.emit("gyro", data);
    });
}   

module.exports = helmet;
