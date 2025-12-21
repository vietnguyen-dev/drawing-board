// Model - Data management and API calls
class GridModel {
  async fetchCoordinates() {
    try {
      const req = await fetch(`/api/coordinates`);
      const data = await req.json();
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}

// View - DOM manipulation and rendering
class GridView {
  constructor() {
    this.board = document.getElementById("canvas");
    this.ctx = this.board.getContext("2d");
    this.border = document.getElementById("border");
    this.square = 100;
  }

  renderCoordinates(data) {
    data.forEach((item) => {
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(item.x, item.y, 5, 5);
    });
  }

  drawBoard() {
    for (let i = 1; i < 10; i++) {
      const startX = this.square * i;
      const startY = 0;
      this.ctx.beginPath();
      this.ctx.lineWidth = 0.5;
      this.ctx.strokeStyle = "#000000";
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(startX, startY + 1000);
      this.ctx.stroke();
    }
    for (let i = 1; i < 10; i++) {
      const startY = this.square * i;
      const startX = 0;
      this.ctx.beginPath();
      this.ctx.lineWidth = 0.5;
      this.ctx.strokeStyle = "#000000";
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(startX + 1000, startY);
      this.ctx.stroke();
    }
  }

  updateBorderPosition(x, y) {
    this.border.style.top = `${y}px`;
    this.border.style.left = `${x}px`;
  }

  getCanvasCoordinates(event) {
    const rect = this.board.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }

  getElement() {
    return this.board;
  }

  getSquareSize() {
    return this.square;
  }
}

// Controller - Event handling and coordination
class GridController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.borderLocation = { x: 0, y: 0 };
    this.init();
  }

  async init() {
    await this.loadGrid();
    this.view.drawBoard();
    this.attachEventListeners();
  }

  async loadGrid() {
    const data = await this.model.fetchCoordinates();
    this.view.renderCoordinates(data);
  }

  attachEventListeners() {
    window.addEventListener("load", () => this.loadGrid());
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        this.loadGrid();
      }
    });

    this.view
      .getElement()
      .addEventListener("click", (e) => this.handleClick(e));
    this.view
      .getElement()
      .addEventListener("mousemove", (e) => this.handleMouseMove(e));
  }

  roundToHundredFloor(n) {
    return Math.floor(n / 100) * 100;
  }

  handleClick(event) {
    const { x, y } = this.view.getCanvasCoordinates(event);

    const params = new URLSearchParams({
      x: this.roundToHundredFloor(x),
      y: this.roundToHundredFloor(y),
    });

    const url = new URL("square.html", window.location.href);
    url.search = params.toString();
    window.location.href = url.toString();
  }

  handleMouseMove(event) {
    const { x, y } = this.view.getCanvasCoordinates(event);
    const square = this.view.getSquareSize();
    const flooredX = Math.floor(x / square) * square;
    const flooredY = Math.floor(y / square) * square;

    if (
      flooredX !== this.borderLocation.x ||
      flooredY !== this.borderLocation.y
    ) {
      this.view.updateBorderPosition(flooredX, flooredY);
      this.borderLocation.x = flooredX;
      this.borderLocation.y = flooredY;
    }
  }
}

// Initialize the application
const model = new GridModel();
const view = new GridView();
const controller = new GridController(model, view);
