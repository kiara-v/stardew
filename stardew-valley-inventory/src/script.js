//=================TOOLTIP====================
let tooltip = document.querySelectorAll(".tooltip");
let itemTooltip = document.querySelectorAll(".item__tooltip");

document.addEventListener("mousemove", fn);

function fn(e) {
  tooltip.forEach((t) => {
    let x = e.clientX;
    let y = e.clientY;

    let newposX = x / 20;
    let newposY = y / 2;
    t.style.transform = "translate3d(" + newposX + "px," + newposY + "px,0px)";
  });

  itemTooltip.forEach((t) => {
    let x = e.clientX;
    let y = e.clientY;

    let newposX = x / 30;
    let newposY = y / 10;
    t.style.transform = "translate3d(" + newposX + "px," + newposY + "px,0px)";
  });
}

//=======DRAG AND DROP================
const items = document.querySelectorAll(".item__container");
const itemContainers = document.querySelectorAll(".items__container");

items.forEach((item) => {
  item.addEventListener("dragstart", dragStart);
});

itemContainers.forEach((square) => {
  square.addEventListener("dragover", dragOver);
  square.addEventListener("drop", dragDrop);
});

let beingDragged;

function dragStart(e) {
  beingDragged = e.target;

  let img = new Image();
  img.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
  e.dataTransfer.setDragImage(img, 0, 0);
}

function dragDrop(e) {
  if (e.target.tagName === "IMG") {
    return;
  }

  e.target.append(beingDragged);
}

function dragOver(e) {
  e.preventDefault();
}
