const mysql = require("mysql2/promise");
const express = require("express");
const app = express();
const port = 3000;
const { PrismaClient } = require("@prisma/client");
const fetch = require("node-fetch");
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

async function getRandomEmoji() {
  try {
    const response = await fetch("https://emojihub.yurace.pro/api/random");
    const emoji = await response.json();
    return emoji;
  } catch (error) {
    console.error("Failed to fetch random emoji:", error);
  }
}

app.get("/random-emoji", async (req, res) => {
  try {
    const emoji = await getRandomEmoji();
    if (emoji) {
      res.json(emoji);
    } else {
      res.status(404).send("No random emoji found");
    }
  } catch (error) {
    console.error("Error in fetching random emoji:", error);
    res.status(500).send("Server error in fetching random emoji");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
