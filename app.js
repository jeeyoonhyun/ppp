var https = require('https');
const fs = require("fs");
const bodyParser = require("body-parser");
const express = require("express");
const path = require('path')
require('dotenv').config()

// HTTPS credentials
const credentials = {
  key:fs.readFileSync('/etc/letsencrypt/live/personalpet.page/privkey.pem'),
  cert:fs.readFileSync('/etc/letsencrypt/live/personalpet.page/fullchain.pem')
}

const app = express();
const port = process.env.PORT || 443;

// socket.io
const server = https.createServer(credentials, app)
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

// object that stores clients' mouse positions
let mouseValues = []

// user connected
io.on("connection", socket => {
  let id = socket.id;
  addClient(socket);
  mouseValues.push({id: socket.id});

  // mouse tracking for map widget
  socket.on("mousemove", data => {
    // update object that has the same user id
    let currentUserIndex = mouseValues.findIndex(e => e.id === data.id)
    mouseValues[currentUserIndex] = data;
    console.log(mouseValues)
  })
 
  // user disconnected
  socket.on("disconnect", socket => {
    removeClient(socket)
    // socket.broadcast.emit('clientdisconnect', id)
  });

  // emit mouse values to client
  setInterval(function(){
    socket.emit("mouseupdate", mouseValues)
  }, 1000);
  
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

// Redirect from http port 80 to https
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);