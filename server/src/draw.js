// Model - Data management and API calls
class DrawingModel {
  constructor() {
    this.grid = [];
    this.urlParams = new URLSearchParams(window.location.search);
  }

  getUrlParams() {
    return {
      x: parseInt(this.urlParams.get("x")),
      y: parseInt(this.urlParams.get("y")),
    };
  }

  async fetchGrid() {
    const { x, y } = this.getUrlParams();
    try {
      const req = await fetch(`/api/coordinates?x=${x}&y=${y}`);
      const data = await req.json();
      this.grid = data;
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async saveCoordinates(coordinates) {
    try {
      await fetch("/api/coordinates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: coordinates }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  async deleteCoordinates(coordinates) {
    try {
      console.log("deleting", coordinates);
      await fetch("/api/coordinates", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: coordinates }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  async generateAIDrawing(message) {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      return data.coordinates;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  filterCoordinates(stroke) {
    const { x, y } = this.getUrlParams();
    return stroke.filter(
      (item) =>
        item.x >= x && item.x < x + 100 && item.y >= y && item.y < y + 100
    );
  }
}

// View - DOM manipulation and rendering
class DrawingView {
  constructor() {
    this.board = document.getElementById("canvas");
    this.ctx = this.board.getContext("2d");
    this.colorInput = document.getElementById("color-picker");
    this.saving = document.getElementById("saving");
    this.erase = document.getElementById("erase");
    this.eraseBorder = document.getElementById("erase-border");
    this.aiInput = document.getElementById("ai-message");
    this.aiForm = document.getElementById("ai-form");
    this.aiButton = document.getElementById("ai-submit");
    this.loading = document.getElementById("loading");
    this.aiAcceptance = document.getElementById("ai-acceptance");
    this.aiAccept = document.getElementById("ai-accept");
    this.aiDeny = document.getElementById("ai-deny");
    this.square = 25;
  }

  drawBoard() {
    for (let i = 1; i < 20; i++) {
      const startX = this.square * i;
      const startY = 0;
      this.ctx.beginPath();
      this.ctx.lineWidth = 0.5;
      this.ctx.strokeStyle = "#000000";
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(startX, startY + 500);
      this.ctx.stroke();
    }
    for (let i = 1; i < 20; i++) {
      const startY = this.square * i;
      const startX = 0;
      this.ctx.beginPath();
      this.ctx.lineWidth = 0.5;
      this.ctx.strokeStyle = "#000000";
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(startX + 500, startY);
      this.ctx.stroke();
    }
  }

  renderGrid(data, urlX, urlY) {
    data.forEach((item) => {
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect((item.x - urlX) * 5, (item.y - urlY) * 5, 25, 25);
    });
  }

  drawPixel(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 0.25;
    this.ctx.fillRect(x, y, this.square, this.square);
    this.ctx.strokeRect(x, y, this.square, this.square);
  }

  drawAIPixel(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 0.25;
    this.ctx.strokeRect(x, y, this.square, this.square);
    this.ctx.fillRect(x, y, this.square, this.square);
  }

  getCanvasCoordinates(event) {
    const rect = this.board.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }

  showSaving() {
    this.saving.classList.remove("hidden");
  }

  hideSaving() {
    this.saving.classList.add("hidden");
  }

  showLoading() {
    this.loading.classList.remove("hidden");
  }

  hideLoading() {
    this.loading.classList.add("hidden");
  }

  showAIAcceptance() {
    this.aiAcceptance.classList.remove("hidden");
  }

  hideAIAcceptance() {
    this.aiAcceptance.classList.add("hidden");
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

  resetAIForm() {
    this.aiForm.reset();
  }

  getSquareSize() {
    return this.square;
  }
}

// Controller - Event handling and coordination
class DrawingController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.color = "#000000";
    this.drawing = false;
    this.deleting = false;
    this.mouseLocation = { x: 0, y: 0 };
    this.stroke = [];
    this.aiMessage = "";
    this.aiCoordinates = [];
    this.init();
  }

  async init() {
    await this.loadGrid();
    this.view.drawBoard();
    this.attachEventListeners();
  }

  async loadGrid() {
    const data = await this.model.fetchGrid();
    const { x, y } = this.model.getUrlParams();
    this.view.renderGrid(data, x, y);
  }

  attachEventListeners() {
    window.addEventListener("load", () => this.loadGrid());

    this.view.colorInput.addEventListener("input", (e) => {
      this.color = e.target.value;
    });

    this.view.board.addEventListener("pointerdown", (e) =>
      this.handlePointerDown(e)
    );
    this.view.board.addEventListener("pointermove", (e) =>
      this.handlePointerMove(e)
    );
    this.view.board.addEventListener("pointerup", () => this.handlePointerUp());
    this.view.board.addEventListener("pointercancel", () =>
      this.handlePointerCancel()
    );

    this.view.erase.addEventListener("click", () => this.toggleEraseMode());
    window.addEventListener("mousemove", (e) => this.handleMouseMove(e));

    this.view.aiInput.addEventListener("input", (e) =>
      this.handleAIInput(e)
    );
    this.view.aiForm.addEventListener("submit", (e) =>
      this.handleAISubmit(e)
    );
    this.view.aiDeny.addEventListener("click", () => this.handleAIDeny());
  }

  handlePointerDown(e) {
    this.drawing = true;
    this.view.board.setPointerCapture(e.pointerId);
    this.view.showSaving();
  }

  handlePointerMove(event) {
    if (!this.drawing) return;

    const { x, y } = this.view.getCanvasCoordinates(event);
    const square = this.view.getSquareSize();
    const flooredX = Math.floor(x / square) * square;
    const flooredY = Math.floor(y / square) * square;

    if (
      flooredX !== this.mouseLocation.x ||
      flooredY !== this.mouseLocation.y
    ) {
      this.mouseLocation.x = flooredX;
      this.mouseLocation.y = flooredY;
      this.view.drawPixel(flooredX, flooredY, this.color);

      const { x: urlX, y: urlY } = this.model.getUrlParams();
      this.stroke.push({
        x: parseInt(flooredX / 5 + urlX),
        y: parseInt(flooredY / 5 + urlY),
        color: this.color,
      });
    }
  }

  async handlePointerUp() {
    this.drawing = false;

    const filtered = this.model.filterCoordinates(this.stroke);

    if (this.deleting) {
      await this.model.deleteCoordinates(filtered);
    } else {
      await this.model.saveCoordinates(filtered);
    }

    this.view.hideSaving();
    this.stroke = [];
  }

  handlePointerCancel() {
    this.drawing = false;
    this.view.hideSaving();
  }

  toggleEraseMode() {
    this.deleting = !this.deleting;
    if (this.deleting) {
      this.view.showEraseBorder();
      this.color = "#FFFFFF";
    } else {
      this.view.hideEraseBorder();
      this.color = "#000000";
    }
  }

  handleMouseMove(e) {
    if (this.deleting) {
      this.view.updateEraseBorderPosition(e.clientX, e.clientY);
    }
  }

  handleAIInput(e) {
    this.aiMessage = e.target.value;
    this.view.aiButton.disabled = this.aiMessage.length === 0;
  }

  async handleAISubmit(e) {
    e.preventDefault();
    this.view.showLoading();

    this.aiCoordinates = await this.model.generateAIDrawing(this.aiMessage);
    this.aiCoordinates.forEach((item) => {
      console.log("Drawing:", item);
      this.view.drawAIPixel(item.x, item.y, item.color);
    });

    this.view.resetAIForm();
    this.aiMessage = "";
    this.view.aiButton.disabled = true;
    this.view.hideLoading();
    this.view.showAIAcceptance();
  }

  async handleAIDeny() {
    this.view.hideAIAcceptance();
    await this.loadGrid();
  }
}

// Initialize the application
const model = new DrawingModel();
const view = new DrawingView();
const controller = new DrawingController(model, view);
