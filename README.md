# Drawing Board

A collaborative pixel art canvas powered by AI. Draw pixel by pixel, or let GPT-4o generate art from your imagination.

**[Live Demo: https://gridsketching.com](https://gridsketching.com)**

## What is this?

Drawing Board is a multiplayer pixel canvas where anyone can create, collaborate, and experiment with pixel art. Think r/place meets DALL-E, but simpler and hackable.

**Key Features:**
- **1000x1000 pixel canvas** - Divided into 100 squares, each with a 20x20 grid
- **AI-powered drawing** - Describe what you want, GPT-4o draws it
- **Collaborative** - Multiple users can draw simultaneously
- **Persistent** - Every pixel is saved and survives restarts

## Tech Stack

- Node.js + Express
- MySQL database
- OpenAI API (GPT-4o)
- HTML5 Canvas
- Bootstrap 5
- Docker + Nginx for deployment

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Nginx    │  ← Load Balancer
└──────┬──────┘
       │
   ┌───┴────┐
   ▼        ▼
┌──────┐ ┌──────┐
│ App1 │ │ App2 │  ← Express Servers
└───┬──┘ └───┬──┘
    │        │
    └────┬───┘
         ▼
    ┌─────────┐
    │  MySQL  │  ← Pixel Storage
    └─────────┘
         +
    ┌─────────┐
    │ OpenAI  │  ← AI Generation
    └─────────┘
```

## How it Works

1. **Canvas Grid** - The main canvas is a 10x10 grid. Click any square to zoom in
2. **Pixel Drawing** - Each square contains a 20x20 pixel grid where you can draw pixel by pixel
3. **AI Generation** - Describe what you want to draw and GPT-4o generates the pixel coordinates
4. **Persistence** - Every pixel is saved so your art survives restarts and can be viewed by others
5. **Scalability** - Load balanced architecture handles multiple concurrent users

## Customization Ideas

- Add user authentication
- Implement real-time updates with WebSockets
- Add color palettes or themes
- Create time-lapse recordings of the canvas
- Add undo/redo functionality
- Implement layers or multiple canvases
- Add pixel history tracking

## License

ISC

## Contributing

PRs welcome! This is a learning project, so feel free to experiment and break things.

---

Built with curiosity and a love for pixel art.
