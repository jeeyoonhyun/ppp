const container = document.querySelector(".container")

// post widget
const createPostWidget = element => {
  const node = document.createElement("div")
  node["title"] = "post"

  const text = document.createTextNode("")
  text["nodeValue"] = "this is a post widget"

  node.appendChild(text)
  container.appendChild(node)
}

let widgets = ['garden','map','post01','post02']
let count = 0;
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight") {
    console.log("Right key pressed!")
    // hide all the other widgets
    for (let i=0; i <widgets.length; i++) {
      document.querySelector(`.${widgets[i]}`).style.visibility = 'hidden';
    }
    // show only current widget
    document.querySelector(`.${widgets[count % widgets.length]}`).style.visibility = 'visible';
    count++;
  }
})
