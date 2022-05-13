// socket.io
// Open and connect socket
let socket = io();

let mouseX, mouseY, prevMouseX, prevMouseY;
// canvas for drawing mouse
// const mouseCanvas = document.querySelector(".mousecanvas")
// const mctx = mouseCanvas.getContext("2d")
// mouseCanvas.width = 500 * window.devicePixelRatio;
// mouseCanvas.height = 500 * window.devicePixelRatio;
// let mouseValues = [];

// Listen for when the socket connects
socket.on("connection", () => {
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

socket.on("mouseupdate", data => {
    mouseValues = data;
    console.log(mouseValues)
    // draw mouses on screen
    // for (let i=0; i < mouseValues.length; i++) {
    //     console.log('drawing!')
    //     mctx.clearRect(0, 0, mouseCanvas.width, mouseCanvas.height);
    //     mctx.beginPath();
    //     mctx.fillStyle = 'black'
    //     // mctx.fillStyle = randomBackgroundColor; //from garden.js
    //     mctx.fillRect(mouseValues[i].mx, mouseValues[i].my, 2, 2);
    // }
})
