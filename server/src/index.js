// Model: Manages state and data
class BoardModel {
  constructor() {
    this.square = 100;
    this.color = "black";
    this.borderLocation = { x: 0, y: 0 };
  }

  setBorderLocation(x, y) {
    this.borderLocation = { x, y };
  }

  roundToHundredFloor(n) {
    return Math.floor(n / 100) * 100;
  }

  async fetchAllCoordinates() {
    try {
      const req = await fetch(`/api/coordinates`);
      return await req.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}

// View: Handles rendering and DOM manipulation
class BoardView {
  constructor() {
    this.board = document.getElementById("canvas");
    this.ctx = this.board.getContext("2d");
    this.border = document.getElementById("border");
  }

  drawBoard(square) {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const startX = square * i;
        const startY = square * j;
        this.ctx.beginPath();
        this.ctx.lineWidth = 0.5;
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(startX, startY + 1000);
        this.ctx.stroke();
      }
    }
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const startX = square * j;
        const startY = square * i;
        this.ctx.beginPath();
        this.ctx.lineWidth = 0.5;
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(startX + 1000, startY);
        this.ctx.stroke();
      }
    }
  }

  drawPixel(x, y, size, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, size, size);
  }

  updateBorderPosition(x, y) {
    this.border.style.top = `${y}px`;
    this.border.style.left = `${x}px`;
  }

  getBoardRect() {
    return this.board.getBoundingClientRect();
  }

  navigateToSquare(x, y) {
    const params = new URLSearchParams({ x, y });
    const url = new URL("square.html", window.location.href);
    url.search = params.toString();
    window.location.href = url.toString();
  }
}

// Controller: Coordinates between Model and View
class BoardController {
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
    const data = await this.model.fetchAllCoordinates();
    data.forEach((item) => {
      this.view.drawPixel(item.x, item.y, 5, item.color);
    });
  }

  setupEventListeners() {
    this.view.board.addEventListener("click", (e) => {
      this.handleBoardClick(e);
    });

    this.view.board.addEventListener("mousemove", (e) => {
      this.handleMouseMove(e);
    });
  }

  handleBoardClick(event) {
    const rect = this.view.getBoardRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const flooredX = this.model.roundToHundredFloor(x);
    const flooredY = this.model.roundToHundredFloor(y);

    this.view.navigateToSquare(flooredX, flooredY);
  }

  handleMouseMove(event) {
    const rect = this.view.getBoardRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const flooredX = Math.floor(x / this.model.square) * this.model.square;
    const flooredY = Math.floor(y / this.model.square) * this.model.square;

    if (
      flooredX !== this.model.borderLocation.x ||
      flooredY !== this.model.borderLocation.y
    ) {
      this.view.updateBorderPosition(flooredX, flooredY);
      this.model.setBorderLocation(flooredX, flooredY);
    }
  }
}

// Initialize the application
window.addEventListener("load", () => {
  const model = new BoardModel();
  const view = new BoardView();
  const controller = new BoardController(model, view);
});
