const socket = io("http://192.168.2.16:3000")

socket.on("connection", ()=> {
    console.log("c")
    socket.emit("ID", "js-controller")
})