// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./config/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

const port = process.env.PORT || 4000;

app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);

  // Test DB connection when server starts
  await testConnection();
});