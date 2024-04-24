const mysql = require("mysql2/promise");
const express = require("express");
const app = express();
const port = 3000;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.static("public"));

app.get("/emojis", async (req, res) => {
  try {
    const emojis = await prisma.emoji.findMany();
    res.json(emojis);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching emojis");
  }
});

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "1234",
  database: "itmd544f",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool
  .getConnection()
  .then((connection) => {
    console.log("Connected to MySQL database!");
    connection.release();
  })
  .catch((err) => {
    console.error("Error connecting to MySQL database:", err);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
