const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);
const { createRoom, addHistory, revokeHistory, restoreHistory} = require('./db');

const rooms = {};

app.use(express.static(__dirname));

app.get('/healthcheck', (req, res) =>{
    res.send('<h1>RPS App running...</h1>');
})

app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/visual_editor.html');
})

io.on('connection', (socket) =>{
    
    socket.on("createEditor", async function() {
        const roomUniqueId = makeid(6);
        socket.join(roomUniqueId);
        rooms[roomUniqueId] = {};
        const roomCnt = await createRoom(roomUniqueId);
        socket.emit("newEditor", {
            roomUniqueId: roomUniqueId,
            roomCnt: roomCnt
        })
    })

    socket.on('joinEditor', (data) => {
        if(rooms[data.roomUniqueId] != null) {
            socket.join(data.roomUniqueId);
            socket.emit("newEditor", {roomUniqueId: data.roomUniqueId})
        }
    })

    socket.on("updateCode", async function(data) {
        var his = await addHistory(data.roomCnt, data.roomUniqueId, data.newVar, data.newCode, data.his);
        io.to(data.roomUniqueId).emit("receiveCode", {
            newCode: data.newCode,
            newVar: data.newVar,
            his: his
        });
    })

    socket.on("revoke", async function(data) {
        var r = await revokeHistory(data.roomUniqueId, data.his);
        io.to(data.roomUniqueId).emit("receiveCode", {
            newCode: r.code,
            newVar: r.variable,
            his: r.his
        });
    })

    socket.on("restore", async function(data) {
        var r = await restoreHistory(data.roomUniqueId, data.his);
        io.to(data.roomUniqueId).emit("receiveCode", {
            newCode: r.code,
            newVar: r.variable,
            his: r.his
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
