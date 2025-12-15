window.addEventListener("load", async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const x = urlParams.get("x");
  const y = urlParams.get("y");
});

const board = document.getElementById("canvas");
const ctx = board.getContext("2d");
const colorInput = document.getElementById("color-picker");

const square = 50;
let color = "#000000";
let drawing = false;

function drawBoard() {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; i < 10; i++) {
      const startX = square * i;
      const startY = square * j;
      ctx.beginPath();
      ctx.moveTo(startX, startY); // start point
      ctx.lineTo(startX, startY + 500); // end point
      ctx.stroke();
    }
  }
  for (let i = 0; i < 10; i++) {
    for (let j = 0; i < 10; i++) {
      const startX = square * j;
      const startY = square * i;
      ctx.beginPath();
      ctx.moveTo(startX, startY); // start point
      ctx.lineTo(startX + 500, startY); // end point
      ctx.stroke();
    }
  }
}

drawBoard();

colorInput.addEventListener("input", (e) => {
  color = e.target.value;
});

function draw(e) {
  console.log(e);
}

board.addEventListener("pointerdown", (e) => {
  drawing = true;
  board.setPointerCapture(e.pointerId);
});

board.addEventListener("pointermove", (e) => {
  if (!drawing) return;

  console.log("drawing", e.clientX, e.clientY);
});

board.addEventListener("pointerup", () => {
  drawing = false;
});

board.addEventListener("pointercancel", () => {
  drawing = false;
});
