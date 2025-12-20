const board = document.getElementById("canvas");
const ctx = board.getContext("2d");
const border = document.getElementById("border");

window.addEventListener("load", async () => {
  try {
    const req = await fetch(`/api/coordinates`);
    const data = await req.json();
    data.forEach((item) => {
      ctx.fillStyle = item.color;
      ctx.fillRect(item.x, item.y, 5, 5);
    });
  } catch (err) {
    console.error(err);
  }
});

const square = 100;
let color = "#000000";
let borderLocation = {
  x: 0,
  y: 0,
};

function drawBoard() {
  for (let i = 1; i < 10; i++) {
    const startX = square * i;
    const startY = 0;
    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#000000";
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY + 1000);
    ctx.stroke();
  }
  for (let i = 1; i < 10; i++) {
    const startY = square * i;
    const startX = 0;
    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#000000";
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + 1000, startY);
    ctx.stroke();
  }
}

drawBoard();

function roundToHundred(n) {
  return Math.ceil(n / 100) * 100;
}

function roundToHundredFloor(n) {
  return Math.floor(n / 100) * 100;
}

function goToSquare(event) {
  const rect = board.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  const params = new URLSearchParams({
    x: roundToHundredFloor(x),
    y: roundToHundredFloor(y),
  });

  // navigate (works with file:// and http://)
  const url = new URL("square.html", window.location.href);
  url.search = params.toString();

  window.location.href = url.toString();
}

function addHoverBorder(event) {
  const rect = board.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  let flooredX = Math.floor(x / square) * square;
  let flooredY = Math.floor(y / square) * square;
  if (flooredX !== borderLocation.x || flooredY !== borderLocation.y) {
    border.style.top = `${flooredY}px`;
    border.style.left = `${flooredX}px`;
    borderLocation.x = flooredX;
    borderLocation.y = flooredY;
  }
}

board.addEventListener("click", goToSquare);
board.addEventListener("mousemove", addHoverBorder);
