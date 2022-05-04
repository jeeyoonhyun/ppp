const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
require('dotenv').config()

const app = express();

const upload_folder = "guestbook";
app.use(express.static("public"));

// app.use(bodyParser.json()); //automatically parses body
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use("/uploaded", express.static(upload_folder));

// // get list of posts
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

// Server listener
app.listen(3000);
console.log("Your app is listening on port " + 3000);
