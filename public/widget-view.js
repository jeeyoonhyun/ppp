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

createPostWidget();