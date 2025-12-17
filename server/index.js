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
  let query = "SELECT * FROM coordinates";
  if (req.query.x != null || req.query.y != null) {
    query = `${query} WHERE x = ${x} AND y = ${y}`;
  }
  query = `${query};`;
  try {
    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/coordinates", async (req, res) => {
  const points = req.body; // [{x,y,color}, ...]

  if (!Array.isArray(points) || points.length === 0) {
    return res.status(400).json({ error: "No data" });
  }

  const values = points.map((p) => [p.x, p.y, p.color]);

  try {
    await pool.query(
      `INSERT INTO coordinates (x, y, color)
       VALUES ?
       ON DUPLICATE KEY UPDATE
         color = VALUES(color),
         updated_at = CURRENT_TIMESTAMP;`,
      [values],
    );

    res.json({ success: true, count: values.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/*
app.put("/api/coordinates", async (req, res) => {
  const { x, y, color } = req.body;
  if (x == null || y == null || !color) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const date = new Date.toString();
  try {
    const [result] = await pool.execute(
      "UPDATE coordinates SET color = ?, updated_at = ? WHERE x = ? AND y = ?;",
      [color, date, x, y],
    );
    res.status(201).json({
      id: result.insertId,
      x,
      y,
      color,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
*/

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
