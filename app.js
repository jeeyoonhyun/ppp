const fs = require("fs");
const bodyParser = require("body-parser");
const express = require("express");
const path = require('path')
require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
const http = require('http');

// socket.io
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server);
const clients = {};

// hide .html extension
app.use(express.static("public", {
  index:false, 
  extensions:['html']
}));


const addClient = socket => {
  console.log("New client connected", socket.id);
  clients[socket.id] = socket;
};
const removeClient = socket => {
  console.log("Client disconnected", socket.id);
  delete clients[socket.id];
};

// object that store client mouse positions
let mousevalues = []

// user connected
io.on("connect", socket => {
  let id = socket.id;
  addClient(socket);
  mousevalues.push({id: socket.id});

  // mouse tracking for map widget
  socket.on("mousemove", data => {
    // update object with same user id
    let currentUserIndex = mousevalues.findIndex(e => e.id === data.id)
    mousevalues[currentUserIndex] = data;
    console.log(mousevalues)
    // emit mouse values to client
    socket.broadcast.emit("mouseupdate", mousevalues)
  })
 
  // user disconnected
  socket.on("disconnect", socket => {
    removeClient(socket)
    // socket.broadcast.emit('clientdisconnect', id)
  });

});


// guestbook
const upload_folder = "guestbook";
app.use(express.static("public"));
// app.use(bodyParser.json()); //automatically parses body
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use("/uploaded", express.static(upload_folder));

// get list of posts
app.get("/posts", (req, res) => {
  fs.promises.readdir(upload_folder)
    .then(files => {
      files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
      res.send(
        JSON.stringify(files));
    });
});

// Upload post route
app.post("/upload/:id", (req, res) => {
  const { image } = req.body;
  const id = req.params.id.toLowerCase().replace(/[^0-9a-zA-Z]+/g, '');
  var base64Data = image.replace(/^data:image\/png;base64,/, "");
  // create new directory if directory does not exist
  let dir = `${upload_folder}`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.writeFile(`${dir}/${id}.png`, base64Data, "base64", err => {
    if (err) { console.log(err) }
  });

  fs.writeFile(`${dir}/latest.png`, base64Data, "base64", err => {
    if (err) { console.log(err) }
  });

  res.json({ id: id });
  console.log("saved " + id);
});


server.listen(port, () => {
  console.log("Your app is listening on port " + port);
});