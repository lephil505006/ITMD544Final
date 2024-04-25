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

app.post("/save-emoji", async (req, res) => {
  const { name, htmlCode, unicode, category, group } = req.body;

  try {
    const emoji = await prisma.emoji.create({
      data: {
        name,
        html_code: htmlCode,
        unicode: unicode.join(" "),
        category,
        group,
      },
    });
    res.status(201).json(emoji);
  } catch (err) {
    console.error("Error saving emoji:", err);
    res.status(500).send("Error saving emoji");
  }
});

app.post("/emoji-reaction", async (req, res) => {
  const { emojiHtml, reactionType } = req.body;

  try {
    // Find the emoji in the database by its HTML code
    const emoji = await prisma.emoji.findUnique({
      where: {
        html_code: emojiHtml,
      },
    });

    if (!emoji) {
      return res.status(404).send("Emoji not found");
    }

    if (reactionType === "like") {
      await prisma.emoji.update({
        where: {
          emoji_id: emoji.emoji_id,
        },
        data: {
          like_count: {
            increment: 1,
          },
        },
      });
    } else if (reactionType === "dislike") {
      await prisma.emoji.update({
        where: {
          emoji_id: emoji.emoji_id,
        },
        data: {
          dislike_count: {
            increment: 1,
          },
        },
      });
    } else {
      return res.status(400).send("Invalid reaction type");
    }

    res.status(200).json({ message: "Reaction recorded successfully" });
  } catch (err) {
    console.error("Error recording emoji reaction:", err);
    res.status(500).send("Error recording reaction");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
