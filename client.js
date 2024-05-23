const socket = io();
var roomUniqueId;
var roomCnt;
var his = 0;

socket.on("newEditor", (data) => {
    roomUniqueId = data.roomUniqueId;
    roomCnt = data.roomCnt;
    document.getElementById('init').style.display = 'none';
    document.getElementById('editor').style.display = 'block';
    let copyButton = document.createElement('button');
    copyButton.style.display = 'block';
    copyButton.innerText = 'Copy Code';
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(roomUniqueId).then(function() {
        }, function(err) {
        });
    });
    document.getElementById('idarea').innerHTML = `Please share code ${roomUniqueId} for joint editing`;
    document.getElementById('idarea').appendChild(copyButton);
});

function replaceElement(htmlString) {
    // Create a new element from the HTML string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    const newElement = tempDiv.firstChild;

    // Find the existing element
    const existingElement = document.getElementById(newElement.id);

    // Replace the existing element with the new element
    if (existingElement) {
        existingElement.parentNode.replaceChild(newElement, existingElement);
    }
}

socket.on("receiveCode", (data) => {

    his = data.his;
    console.log(his);

    replaceElement(data.newCode);
    replaceElement(data.newVar);

    slistAll = document.querySelectorAll(".slist")
    slistAll.forEach(slist => {
        setSlistTriggers(slist);
    })
    setDropdowns();
    addVar();
    setEditable();
})

document.getElementById("createbtn").addEventListener("click", function () {
    socket.emit('createEditor');
})

document.getElementById("joinbtn").addEventListener("click", function () {
    roomUniqueId = document.getElementById('roomUniqueId').value;
    socket.emit('joinEditor', {roomUniqueId: roomUniqueId});
})

document.getElementById("revoke").addEventListener("click", function () {
    socket.emit('revoke', {
        roomUniqueId: roomUniqueId,
        his: his
    });
});
