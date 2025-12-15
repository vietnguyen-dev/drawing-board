window.addEventListener("load", async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const x = urlParams.get("x");
  const y = urlParams.get("y");
  console.log(x, y);
});

const board = document.getElementById("canvas");
const ctx = board.getContext("2d");
const colorInput = document.getElementById("color-picker");

const square = 50;
let color = "#000000";
let drawing = false;
let mouseLocation = {
  x: 0,
  y: 0,
};
let stroke = [];

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

board.addEventListener("pointerdown", (e) => {
  drawing = true;
  board.setPointerCapture(e.pointerId);
});

board.addEventListener("pointermove", (event) => {
  if (!drawing) return;
  const rect = board.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  let flooredX = Math.floor(x / square) * square;
  let flooredY = Math.floor(y / square) * square;
  if (flooredX !== mouseLocation.x || flooredY !== mouseLocation.y) {
    mouseLocation.x = flooredX;
    mouseLocation.y = flooredY;
    ctx.fillStyle = color;
    ctx.fillRect(flooredX, flooredY, square, square);
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const urlX = urlParams.get("x");
    const urlY = urlParams.get("y");
    stroke.push({
      x: flooredX / 5 + parseInt(urlX),
      y: flooredY / 5 + parseInt(urlY),
      color: color,
    });
  }
});

board.addEventListener("pointerup", async () => {
  drawing = false;
  console.log(stroke);
  const req = await fetch("/api/coordinates", {});
  stroke = [];
});

board.addEventListener("pointercancel", () => {
  drawing = false;
});
