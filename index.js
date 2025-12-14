import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Required for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Serve static files from /src
app.use(express.static(path.join(__dirname, "src")));

// Optional: root route explicitly
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
