import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: "localhost", // "mysql" if Node is in Docker
  user: "appuser",
  password: "apppassword",
  database: "appdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Required for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from /src
app.use(express.static(path.join(__dirname, "src")));

// Optional: root route explicitly
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

app.get("/api/coordinates", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM coordinates;");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
