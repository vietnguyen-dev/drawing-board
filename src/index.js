window.addEventListener("load", async () => {
  const res = await fetch("/api/coordinates");
  const data = await res.json();
  console.log(data);
});

const board = document.getElementById("canvas");
const ctx = board.getContext("2d");
const border = document.getElementById("border");

const square = 100;
let color = "black";
let borderLocation = {
  x: 0,
  y: 0,
};

function drawBoard() {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; i < 10; i++) {
      const startX = square * i;
      const startY = square * j;
      ctx.beginPath();
      ctx.moveTo(startX, startY); // start point
      ctx.lineTo(startX, startY + 1000); // end point
      ctx.stroke();
    }
  }
  for (let i = 0; i < 10; i++) {
    for (let j = 0; i < 10; i++) {
      const startX = square * j;
      const startY = square * i;
      ctx.beginPath();
      ctx.moveTo(startX, startY); // start point
      ctx.lineTo(startX + 1000, startY); // end point
      ctx.stroke();
    }
  }
}

drawBoard();

function roundToHundred(n) {
  return Math.ceil(n / 100) * 100;
}

function goToSquare(event) {
  const rect = board.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  const params = new URLSearchParams({
    x: roundToHundred(x),
    y: roundToHundred(y),
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
