// Model: Manages state and data
class DrawingModel {
  constructor() {
    this.square = 25;
    this.color = "#000000";
    this.drawing = false;
    this.mouseLocation = { x: 0, y: 0 };
    this.stroke = [];
    this.deleting = false;
  }

  setColor(color) {
    this.color = color;
  }

  setDrawing(isDrawing) {
    this.drawing = isDrawing;
  }

  setDeleting(isDeleting) {
    this.deleting = isDeleting;
    this.color = isDeleting ? "#FFFFFF" : "#000000";
  }

  toggleDeleting() {
    this.setDeleting(!this.deleting);
  }

  updateMouseLocation(x, y) {
    this.mouseLocation = { x, y };
  }

  addToStroke(x, y, color) {
    this.stroke.push({ x, y, color });
  }

  clearStroke() {
    this.stroke = [];
  }

  filterStroke(minX, minY, maxX, maxY) {
    return this.stroke.filter(
      (item) => item.x >= minX && item.x < maxX && item.y >= minY && item.y < maxY
    );
  }

  async fetchCoordinates(x, y) {
    try {
      const req = await fetch(`/api/coordinates?x=${x}&y=${y}`);
      return await req.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async saveCoordinates(data, isDelete = false) {
    try {
      const method = isDelete ? "DELETE" : "POST";
      await fetch("/api/coordinates", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });
    } catch (err) {
      console.error(err);
    }
  }
}

// View: Handles rendering and DOM manipulation
class DrawingView {
  constructor() {
    this.board = document.getElementById("canvas");
    this.ctx = this.board.getContext("2d");
    this.colorInput = document.getElementById("color-picker");
    this.saving = document.getElementById("saving");
    this.erase = document.getElementById("erase");
    this.eraseBorder = document.getElementById("erase-border");
  }

  drawBoard(square) {
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        const startX = square * i;
        const startY = square * j;
        this.ctx.beginPath();
        this.ctx.lineWidth = 0.25;
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(startX, startY + 500);
        this.ctx.stroke();
      }
    }
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        const startX = square * j;
        const startY = square * i;
        this.ctx.beginPath();
        this.ctx.lineWidth = 0.25;
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(startX + 500, startY);
        this.ctx.stroke();
      }
    }
  }

  drawSquare(x, y, size, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, size, size);
  }

  showSaving() {
    this.saving.classList.remove("hidden");
  }

  hideSaving() {
    this.saving.classList.add("hidden");
  }

  showEraseBorder() {
    this.eraseBorder.classList.remove("hidden");
  }

  hideEraseBorder() {
    this.eraseBorder.classList.add("hidden");
  }

  updateEraseBorderPosition(x, y) {
    this.eraseBorder.style.left = `${x}px`;
    this.eraseBorder.style.top = `${y}px`;
  }

  getBoardRect() {
    return this.board.getBoundingClientRect();
  }
}

// Controller: Coordinates between Model and View
class DrawingController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.init();
  }

  async init() {
    this.view.drawBoard(this.model.square);
    await this.loadInitialData();
    this.setupEventListeners();
  }

  async loadInitialData() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const x = urlParams.get("x");
    const y = urlParams.get("y");

    const data = await this.model.fetchCoordinates(x, y);
    data.forEach((item) => {
      this.view.drawSquare(
        (item.x - x) * 5,
        (item.y - y) * 5,
        25,
        item.color
      );
    });
  }

  setupEventListeners() {
    this.view.colorInput.addEventListener("input", (e) => {
      this.handleColorChange(e.target.value);
    });

    this.view.board.addEventListener("pointerdown", (e) => {
      this.handlePointerDown(e);
    });

    this.view.board.addEventListener("pointermove", (e) => {
      this.handlePointerMove(e);
    });

    this.view.board.addEventListener("pointerup", () => {
      this.handlePointerUp();
    });

    this.view.board.addEventListener("pointercancel", () => {
      this.handlePointerCancel();
    });

    this.view.erase.addEventListener("click", () => {
      this.handleEraseToggle();
    });

    window.addEventListener("mousemove", (e) => {
      this.handleMouseMove(e);
    });
  }

  handleColorChange(color) {
    this.model.setColor(color);
  }

  handlePointerDown(e) {
    this.model.setDrawing(true);
    this.view.board.setPointerCapture(e.pointerId);
    this.view.showSaving();
  }

  handlePointerMove(event) {
    if (!this.model.drawing) return;

    const rect = this.view.getBoardRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const flooredX = Math.floor(x / this.model.square) * this.model.square;
    const flooredY = Math.floor(y / this.model.square) * this.model.square;

    if (
      flooredX !== this.model.mouseLocation.x ||
      flooredY !== this.model.mouseLocation.y
    ) {
      this.model.updateMouseLocation(flooredX, flooredY);
      this.view.drawSquare(
        flooredX,
        flooredY,
        this.model.square,
        this.model.color
      );

      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const urlX = urlParams.get("x");
      const urlY = urlParams.get("y");

      this.model.addToStroke(
        parseInt(flooredX / 5 + parseInt(urlX)),
        parseInt(flooredY / 5 + parseInt(urlY)),
        this.model.color
      );
    }
  }

  async handlePointerUp() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const x = parseInt(urlParams.get("x"));
    const y = parseInt(urlParams.get("y"));

    this.model.setDrawing(false);

    const filtered = this.model.filterStroke(x, y, x + 100, y + 100);

    if (this.model.deleting) {
      console.log("deleting", this.model.stroke);
      await this.model.saveCoordinates(filtered, true);
    } else {
      await this.model.saveCoordinates(filtered, false);
    }

    this.view.hideSaving();
    this.model.clearStroke();
  }

  handlePointerCancel() {
    this.model.setDrawing(false);
    this.view.hideSaving();
  }

  handleEraseToggle() {
    this.model.toggleDeleting();
    if (this.model.deleting) {
      this.view.showEraseBorder();
    } else {
      this.view.hideEraseBorder();
    }
  }

  handleMouseMove(e) {
    if (this.model.deleting) {
      this.view.updateEraseBorderPosition(e.clientX, e.clientY);
    }
  }
}

// Initialize the application
window.addEventListener("load", () => {
  const model = new DrawingModel();
  const view = new DrawingView();
  const controller = new DrawingController(model, view);
});
