// socket.io
// Open and connect socket
let socket = io();
let mouseX, mouseY, prevMouseX, prevMouseY;

// Listen for when the socket connects
socket.on("connect", function () {
    // Log a success message
    console.log("Client connected");
});


window.addEventListener('mousemove', e => {
    mouseX = e.pageX;
    mouseY = e.pageY;
})

// emit mouse position every 500ms
window.setInterval(() => {
    // emit mouse position
    if (prevMouseX !== mouseX || !prevMouseY !== mouseY) {
        socket.emit("mousemove", { id: socket.id, mx: mouseX, my: mouseY });
    }
    prevMouseX = mouseX;
    prevMouseY = mouseY;
}, 1000)


// draw mouses on screen
socket.on("mouseupdate", data => {
    console.log(data);
})