// socket.io
// Open and connect socket
let socket = io();

// Listen for when the socket connects
socket.on("connect", function () {
    // Log a success message
    console.log("Client connected");
});

// emit mouse position every 500ms
window.setInterval((socket) => {
    // track mouse position

    // emit mouse position
    if (prevMouseX !== x || !prevMouseY !== y) {
        socket.emit('mouse_position', { mx: x, my: y });
    }
}, 500)


// draw mouse on screen
