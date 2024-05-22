const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname));

app.get('/healthcheck', (req, res) =>{
    res.send('<h1>RPS App running...</h1>');
})

app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/visual_editor.html');
})

io.on('connection', (socket) =>{
    socket.on('disconnect', () =>{
        console.log("user disconnected");
    })
    
    socket.on("")
})

server.listen(3010, () => {
    console.log('listening on *:3010');
})
