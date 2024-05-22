const socket = io();
var roomUniqueId;

socket.on("newEditor", (data) => {
    roomUniqueId = data.roomUniqueId;
    document.getElementById('init').style.display = 'none';
    document.getElementById('editor').style.display = 'block';
    let copyButton = document.createElement('button');
    copyButton.style.display = 'block';
    copyButton.innerText = 'Copy Code';
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(roomUniqueId).then(function() {
            console.log('Async: Copying to clipboard was successful!');
        }, function(err) {
            console.error('Async: Could not copy text: ', err);
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

socket.on("receiveVar", (data) => {
    oldChild = document.getElementById("var_menu");
    replaceElement(data.newVar);
})

document.getElementById("createbtn").addEventListener("click", function () {
    socket.emit('createEditor');
})

document.getElementById("joinbtn").addEventListener("click", function () {
    roomUniqueId = document.getElementById('roomUniqueId').value;
    socket.emit('joinEditor', {roomUniqueId: roomUniqueId});
})
