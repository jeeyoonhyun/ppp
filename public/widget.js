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

// createPostWidget();

//draggable widget element

const makeDraggable = element => {

  let activeElement = null;
  let xOffset = 0;
  let yOffset = 0;

  let topZ = element.style.zIndex;

  // 22-05-03: I used document.addEventListener instead of element.addEventListener because
  // when the mouse moves too fast, the mouse goes out of the element
  // and loses target which causes a bug that makes the element not movable.
  document.addEventListener("mousemove", (e) => {
    // The pageX read-only property of the MouseEvent interface returns the X (horizontal) coordinate (in pixels) at which the mouse was clicked, 
    // relative to the left edge of the entire document. This includes any portion of the document not currently visible.
    if (activeElement == null) {
      return; //function stops from this line
    }
    activeElement.style.left = e.pageX - xOffset + "px";
    activeElement.style.top = e.pageY - yOffset + "px";

    //TODO: restrict position so that it doesn't go outside the window size
    // console.log('moving' + activeElement.innerText);
  });
  
  
  element.addEventListener("mousedown", (e) => {
    e.preventDefault(); //prevent dragging element
    let bounds = e.currentTarget.parentElement.getBoundingClientRect(); //object having the position / bounds
    xOffset = e.pageX - bounds.left;
    yOffset = e.pageY - bounds.top;
    console.log(e.currentTarget.parentElement); //tells which element the event was sent to
    activeElement = e.currentTarget.parentElement;
    activeElement.style.zIndex = topZ;
    topZ++;
  }); 
  
  element.addEventListener("mouseup", (e) => {
    activeElement = null;
  });


  document.documentElement.addEventListener('mouseleave', e => {
    activeElement = null;
  })
  
  document.documentElement.addEventListener('mouseenter', e => {
    activeElement = null;
  })
}

// make all widgets draggable
for(i of document.querySelectorAll('.statusbar')) {
  makeDraggable(i)
}

// randomize widget positions
let widgets = document.querySelectorAll('.widget')
// randomize css
// widgets.forEach( e => {
//   e.style.top = `${Math.floor(Math.random()*800)}px`
//   e.style.left = `${Math.floor(Math.random()*500)}px`
// })