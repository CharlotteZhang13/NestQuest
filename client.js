const socket = io();

function createEditor() {
    socket.emit('createEditor');
}