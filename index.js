const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

const rooms = {};

app.use(express.static(__dirname));

app.get('/healthcheck', (req, res) =>{
    res.send('<h1>RPS App running...</h1>');
})

app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/visual_editor.html');
})

io.on('connection', (socket) =>{
    socket.on('disconnect', () =>{
    })
    
    socket.on("createEditor", () => {
        const roomUniqueId = makeid(6);
        socket.join(roomUniqueId);
        rooms[roomUniqueId] = {};
        socket.emit("newEditor", {roomUniqueId: roomUniqueId})
    })

    socket.on('joinEditor', (data) => {
        if(rooms[data.roomUniqueId] != null) {
            socket.join(data.roomUniqueId);
            socket.emit("newEditor", {roomUniqueId: data.roomUniqueId})
        }
    })

    socket.on("updateVar", (data) => {
        io.to(data.roomUniqueId).emit("receiveVar", {
            newVar: data.newVar
        });
    })

    socket.on("updateCode", (data) => {
        console.log(data.newCode);
        io.to(data.roomUniqueId).emit("receiveCode", {
            newCode: data.newCode
        });
    })
})

server.listen(3010, () => {
    console.log('listening on *:3010');
})

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
