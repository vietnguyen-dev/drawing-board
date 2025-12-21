import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import OpenAI from "openai";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 3000;

dotenv.config();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: process.env.host, // "mysql" if Node is in Docker
  user: process.env.username,
  password: process.env.password,
  database: process.env.database,
  port: parseInt(process.env.port),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync("../cert/ca-certificate.crt"),
  },
});

const client = new OpenAI({
  apiKey: process.env.openai, // This is the default and can be omitted
});

// Required for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional: root route explicitly
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

// Serve static files from /src
app.use(express.static(path.join(__dirname, "src")));

app.get("/api/coordinates", async (req, res) => {
  let query = "SELECT * FROM coordinates";
  const x = req.query.x;
  const y = req.query.y;
  if (req.query.x != null || req.query.y != null) {
    query = `${query} WHERE x >= ${x} AND x <= ${x + 100} AND y >= ${y} AND y <= ${y + 100}`;
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
  const points = req.body.data; // [{x,y,color}, ...]

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

app.delete("/api/coordinates", async (req, res) => {
  const points = req.body.data; // [{x,y,color}, ...]

  if (!Array.isArray(points) || points.length === 0) {
    return res.status(400).json({ error: "No data" });
  }
  const keys = points.map((point) => [point.x, point.y]);
  let keyString = keys.join("],[");
  keyString = keyString.replaceAll("]", ")").replaceAll("[", "(");
  const sql = `DELETE FROM coordinates WHERE (x, y) IN ((${keyString}));`;

  try {
    await pool.execute(sql);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/generate", async (req, res) => {
  const message = req.body.message;
  try {
    const response = await client.responses.create({
      model: "gpt-4o",
      input: `I want to draw ${message} on a html canvas that is 500px by 500px. it is a 20 * 20 grid, where each square in the grid represents 25 pixels. give me an array of objects that look like {x: value, y: value, color: color value} that draw what ${message}. each object x and y values should be multples of 25 and color value is hex. give me the array of objects nothing else. absolutely do other messages from you. I am going to turn this text into data to send back to the user color it too, use any and all hex values you want. be creative!`,
    });
    let cleaned = response.output_text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parsed = JSON.parse(cleaned);

    res.json({ success: true, coordinates: parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAi error" });
    console;
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
