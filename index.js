const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

const rooms = {};

app.use(express.static(path.join(__dirname, 'client')));

app.get('/healthcheck', (req, res) =>{
    res.send('<h1>RPS App running...</h1>');
})

app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/client/index.html');
})

server.listen(3000, () => {
    console.log('listening on *:3000');
})
