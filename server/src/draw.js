const board = document.getElementById("canvas");
const ctx = board.getContext("2d");
const colorInput = document.getElementById("color-picker");

const square = 25;
let color = "#000000";
let drawing = false;
let mouseLocation = {
  x: 0,
  y: 0,
};
let stroke = [];
let deleting = false;

window.addEventListener("load", async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const x = urlParams.get("x");
  const y = urlParams.get("y");
  try {
    const req = await fetch(`/api/coordinates?x=${x}&y=${y}`);
    const data = await req.json();
    data.forEach((item) => {
      ctx.fillStyle = item.color;
      ctx.fillRect((item.x - x) * 5, (item.y - y) * 5, 25, 25);
    });
  } catch (err) {
    console.error(err);
  }
});

function drawBoard() {
  for (let i = 1; i < 20; i++) {
    const startX = square * i;
    const startY = 0;
    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#000000";
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY + 500);
    ctx.stroke();
  }
  for (let i = 1; i < 20; i++) {
    const startY = square * i;
    const startX = 0;
    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#000000";
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + 500, startY);
    ctx.stroke();
  }
}

drawBoard();

colorInput.addEventListener("input", (e) => {
  color = e.target.value;
});

board.addEventListener("pointerdown", (e) => {
  drawing = true;
  board.setPointerCapture(e.pointerId);
  saving.classList.remove("hidden");
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
    ctx.strokeStyle = "#000000"; // dark border
    ctx.lineWidth = 0.25;
    ctx.fillRect(flooredX, flooredY, square, square);
    ctx.strokeRect(flooredX, flooredY, square, square);
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const urlX = urlParams.get("x");
    const urlY = urlParams.get("y");
    stroke.push({
      x: parseInt(flooredX / 5 + parseInt(urlX)),
      y: parseInt(flooredY / 5 + parseInt(urlY)),
      color: color,
    });
  }
});

const saving = document.getElementById("saving");

board.addEventListener("pointerup", async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const x = parseInt(urlParams.get("x"));
  const y = parseInt(urlParams.get("y"));
  drawing = false;

  let filtered = stroke.filter(
    (item) =>
      item.x >= x && item.x < x + 100 && item.y >= y && item.y < y + 100,
  );

  try {
    if (deleting) {
      console.log("deleting", stroke);
      const req = await fetch("/api/coordinates", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: filtered }),
      });
    } else {
      const req = await fetch("/api/coordinates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: filtered }),
      });
    }
  } catch (err) {
    console.error(err);
  }
  saving.classList.add("hidden");
  stroke = [];
});

board.addEventListener("pointercancel", () => {
  drawing = false;
  saving.classList.add("hidden");
});

const clear = document.getElementById("clear");
const erase = document.getElementById("erase");
const eraseBorder = document.getElementById("erase-border");

erase.addEventListener("click", () => {
  deleting = !deleting;
  if (deleting) {
    eraseBorder.classList.remove("hidden");
    color = "#FFFFFF";
  } else {
    eraseBorder.classList.add("hidden");
    color = "#000000";
  }
});

window.addEventListener("mousemove", (e) => {
  if (deleting) {
    eraseBorder.style.left = `${e.clientX}px`;
    eraseBorder.style.top = `${e.clientY}px`;
  }
});
