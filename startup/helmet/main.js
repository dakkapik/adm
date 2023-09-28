const { io } = require("socket.io-client");
const { spawn, execSync } = require("child_process");
const path = require("path");

const driverDir = path.resolve(path.join(__dirname,'../../driver'))

console.log("DRIVE DIR: ",driverDir)
const ipAddresses = [
    "http://192.168.2.15:3000",
    "http://192.168.2.14:3000",
    "http://192.168.2.19:3000",
    "http://192.168.2.11:3000",
    'http://192.168.2.12:3000',
    "http://192.168.2.16:3000",
    "http://192.168.0.14:3000",
    "http://192.168.0.100:3000",
    "http://192.168.0.109:3000"
]
const sockets = []
let socket;

// helmet();
function helmet (linux, sysname) {
    console.log("connecting to server...")
    for(let i = 0; i < ipAddresses.length; i++) {
        sockets[i] = io(ipAddresses[i])
        sockets[i].on("connect", ()=> {
            socket = sockets[i];
            console.log("CONNECTION");
            socket.emit("ID", "helmet");
            flushSockets(i);
            exec();
        })
    }
}

function flushSockets(exception) {
    console.log("FLUSHING SOCKETS")
    for(let i = 0; i < ipAddresses.length; i++) {
        if(i !== exception){
            sockets[i].close();
            sockets[i] = null;
        }
    }
}

async function exec () {
    
    console.log("CLEANUP")
    // DON'T CRASH ON ERROR IDK --> if no exec it crashes
    // await execSync ("rm exec",{cwd: driverDir}, (err, stdout, stderr) => {
    //     if(!err) {
    //         // change this, something better
    //         console.log('subprocess stdout: ', Buffer.from(stdout).toString())
    //         console.log('subprocess stderr: ', Buffer.from(stderr).toString())
    //         // resolve()
            
    //     } else {
    //         console.error("BUILD ERROR: ",err)
    //         // rejects("Subprocess error: ", err)
    //     }
    // })
    
    console.log("COMPILING")

    // await execSync("gcc gyro.cpp -lstdc++ -lwiringPi -lpthread -o exec -lm", {
    await execSync("gcc main.cpp mpu.cpp -lstdc++ -lwiringPi -lpthread -o exec -lm", {
        cwd: driverDir
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

    const child = spawn('python programname.py', [] ,{
        stdio: ['ignore', 'pipe', process.stderr],
        cwd: driverDir
    });

    child.stdout.on("data", (data)=>{
        socket.emit("orientation", data);
    });
}   

helmet()
exec()

