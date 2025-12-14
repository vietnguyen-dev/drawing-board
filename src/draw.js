window.addEventListener("load", async () => {
  console.log("load square data here 222");
  console.log("URL:");

  const queryString = window.location.search;

  const urlParams = new URLSearchParams(queryString);

  const x = urlParams.get("x"); // 'Ian'
  const y = urlParams.get("y");

  console.log(x, y);
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
  console.log(e.target.value);
});
