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
  timeout: 180 * 1000,
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
  const x = parseInt(req.query.x);
  const y = parseInt(req.query.y);
  const range = [x, x + 100, y, y + 100];
  if (req.query.x != null || req.query.y != null) {
    query = `${query} WHERE x >= ? AND x < ? AND y >= ? AND y < ?`;
  }
  query = `${query};`;
  try {
    const [rows] = await pool.execute(query, range);
    res.json({ success: true, count: rows.length, data: rows });
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
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
/*
app.post("/api/generate", async (req, res) => {
  // timeout set this long only for this route
  req.setTimeout(320000); // 3 minutes
  res.setTimeout(320000);

  const message = req.body.message;
  let input = `I want to draw ${message} on a 500 * 500 pixel grid on html canvas`;
  input += `it is a grid of 20 by 20 squares that are 25 * 2x pixels`;
  input += `the data for this drawing is an array of objects that look like { x: coordinate, x: coordinate, color: hex color}`;
  input += `draw on the entire grid, it should be 200 objects total, use a lot of hex colors not just black and white but white space as needed`;
  input += `give me this array of 400 total objects to draw ${message}`;
  input += `array of objects shold start at {x:0,y:0,color: color} and end with {x:195,y:195,color: color}`;
  input += `each object should be multiples of 25 up to 500. on both x and y values`;
  input += `You return ONLY valid JSON array with no explanatory text`;
  try {
    const response = await client.responses.create({
      model: "gpt-4o",
      input: input,
    });
    let cleaned = response.output_text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parsed = JSON.parse(cleaned);

    res.json({ success: true, length: parsed.length, coordinates: parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAi error" });
    console;
  }
});
*/
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
