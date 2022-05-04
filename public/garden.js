let canvas = document.getElementById("canvas");
let message = document.getElementById("message");
let undoBtn = document.getElementById("undo");
let resetBtn = document.getElementById("reset");
let updates = document.getElementById("updates-content");

// let pixelRatio = window.devicePixelRatio;
let pixelRatio = 1;
// for fullscreen
// canvas.width = window.innerWidth * pixelRatio;
// canvas.height = window.innerHeight * pixelRatio;

canvas.width = 300 * pixelRatio;
canvas.height = 275 * pixelRatio; //TODO: change size?

// fisher-yates shuffle function
function shuffle(sourceArray) {
  for (var i = 0; i < sourceArray.length - 1; i++) {
    var j = i + Math.floor(Math.random() * (sourceArray.length - i));

    var temp = sourceArray[j];
    sourceArray[j] = sourceArray[i];
    sourceArray[i] = temp;
  }
  return sourceArray;
}

function getImage() {
  fetch("/posts", {
    method: "get"
  })
    .then(response => {
      img = new Image();
      img.src = `./uploaded/${id}.png`;
      drawImage();
    });
}

// get a random color
// let randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
// generate separate colors for background and stroke
let h = Math.floor(360 * Math.random())
let s = Math.floor(70 + 20 * Math.random())
let l = Math.floor(75 + 10 * Math.random())
let randomColor = "hsl(" + h + ',' + s + '%,' + l + '%)'
let randomBackgroundColor = "hsl(" + h + ',' + (s + 10) + '%,' + (l + 12) + '%)'
document.body.style.backgroundColor = randomBackgroundColor;

let id = new Date()

//UPLOAD CANVAS TO SERVER
const uploadImage = e => {
  let payload = {
    image: canvas.toDataURL("image/png"),
    id: id
  };
  fetch(`/upload/${id}`, {
    method: "POST",
    body: JSON.stringify(payload), // data can be `string` or {object}!
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(response => {
      console.log("Success:", JSON.stringify(response));
    });
  message.innerText = "saved!";
}

// DRAWING STUFF
var ctx = canvas.getContext("2d");

// Get the last sketch as a background for the canvas
let img = new Image();
// change the image source to be the image of the current id
img.src = `./uploaded/latest.png`;

const drawImage = () => {
  let canvasRatio = canvas.width / canvas.height;
  let imageRatio = img.width / img.height;

  if (canvasRatio < imageRatio) {
    ctx.drawImage(
      img,
      0,
      (canvas.height - canvas.width / imageRatio) / 2,
      canvas.width,
      canvas.width / imageRatio
    );
  } else {
    ctx.drawImage(
      img,
      (canvas.width - canvas.height * imageRatio) / 2,
      0,
      canvas.height * imageRatio,
      canvas.height
    );
  }
};

img.onload = function () {
  drawImage();
}

let mousedown = false;
let last_x = 0;
let last_y = 0;


let undoStack = [];
undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
// bug: erases the original image
function pushState() {
  undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (undoStack.length > 50) {
    undoStack.shift();
  }
}

// // undo button
// undoBtn.addEventListener("click", () => {
//   undoStack.pop();
//   let lastItem = undoStack[undoStack.length - 1];
//   if (lastItem) {
//     ctx.putImageData(lastItem, 0, 0); //don't pop anything if you have nothing in the undo stack
//   }
//   uploadImage();
// });

// note: redo uses 2 stacks

// reset button
reset.addEventListener("click", e => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  message.innerText = "Canvas cleared!";
});

// you might wanna use https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

// draw functions
let isDrawing = false;
let lastX = null;
let lastY = null;

function distance(aX, aY, bX, bY) {
  return Math.sqrt(Math.pow(aX - bX, 2) + Math.pow(aY - bY, 2));
}
function pointsAlongLine(startx, starty, endx, endy, spacing) {
  let dist = distance(startx, starty, endx, endy);
  let steps = dist / spacing;

  let points = [];
  for (var d = 0; d <= 1; d += 1 / steps) {
    let point = {
      x: startx * d + endx * (1 - d),
      y: starty * d + endy * (1 - d)
    };
    points.push(point);
  }
  return points;
}

function drawStart(x, y) {
  isDrawing = true;
  lastX = x;
  lastY = y;
}
function rand() {
  return Math.random() - 0.5;
}
function drawMove(x, y) {
  if (isDrawing === false) {
    return;
  }

  let thickness = 1;
  ctx.strokeStyle = "white";
  ctx.lineWidth = thickness;
  let speed = distance(x, y, lastX, lastY);
  let spread = 6;

  let bounds = canvas.getBoundingClientRect();

  let points = pointsAlongLine(
    x - bounds.left,
    y - bounds.top,
    lastX - bounds.left,
    lastY - bounds.top,
    3
  );

  points.forEach(point => {
    // draw cloud
    for (let i = 0; i < 4 * speed; i++) {
      ctx.fillStyle = randomColor;
      ctx.fillRect(point.x + rand() * spread, point.y + rand() * spread, 1, 1);
    }
  });

  ctx.strokeStyle = randomColor;

  lastX = x;
  lastY = y;
}

function drawEnd() {
  if (isDrawing) {
    pushState();
  }
  isDrawing = false;
  uploadImage();
}

// event listeners
canvas.addEventListener("mousedown", event =>
  drawStart(event.pageX * pixelRatio, event.pageY * pixelRatio)
);
canvas.addEventListener("mouseup", drawEnd);
canvas.addEventListener("mouseout", drawEnd);
canvas.addEventListener("mousemove", event =>
  drawMove(event.pageX * pixelRatio, event.pageY * pixelRatio)
);

canvas.addEventListener("touchstart", event => {
  let touches = event.touches;
  let firstTouch = touches[0];
  drawStart(firstTouch.pageX * pixelRatio, firstTouch.pageY * pixelRatio);
});
canvas.addEventListener("touchend", drawEnd);
canvas.addEventListener("touchmove", event => {
  let touches = Array.from(event.touches);

  if (touches.length !== 1) {
    return;
  }
  event.preventDefault();

  let firstTouch = touches[0];

  drawMove(firstTouch.pageX * pixelRatio, firstTouch.pageY * pixelRatio);
});