const mysql = require("mysql2/promise");
const express = require("express");
const app = express();
const port = 3000;
const { PrismaClient } = require("@prisma/client");
const fetch = require("node-fetch");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  console.log("Serving login.html");
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).send("User registration failed.");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({ message: "Login successful", token });
    } else {
      res.status(401).send("Authentication failed");
    }
  } catch (error) {
    res.status(500).send("Login failed.");
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "process.env.JWT_SECRET", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Access to protected data", user: req.user });
});

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

    // Update usage after emoji is saved
    const usageUpdate = await updateEmojiUsage(emoji.emoji_id);
    console.log("Usage Updated:", usageUpdate);

    res.status(201).json(emoji);
  } catch (err) {
    console.error("Error saving emoji:", err);
    res.status(500).send("Error saving emoji");
  }
});

app.post("/emoji-reaction", async (req, res) => {
  const { emojiHtml, reactionType, sessionId } = req.body;

  try {
    const emoji = await prisma.emoji.findUnique({
      where: { html_code: emojiHtml },
    });

    if (!emoji) {
      return res.status(404).send("Emoji not found");
    }

    const newReaction = await prisma.emojiReaction.create({
      data: {
        emoji_id: emoji.emoji_id,
        session_id: sessionId || "defaultSession",
        reaction_type: reactionType,
        created_at: new Date(),
      },
    });

    res
      .status(201)
      .json({ message: "Reaction recorded successfully", newReaction });
  } catch (err) {
    console.error("Error recording emoji reaction:", err);
    res.status(500).send("Error recording reaction");
  }
});

app.post("/update-usage", async (req, res) => {
  const { emojiId } = req.body;
  if (!emojiId) {
    return res.status(400).send("Emoji ID is required.");
  }

  try {
    const existingUsage = await prisma.emojiUsage.findUnique({
      where: { emoji_id: emojiId },
    });

    if (existingUsage) {
      const updatedUsage = await prisma.emojiUsage.update({
        where: { emoji_id: emojiId },
        data: {
          usage_count: { increment: 1 },
          last_used_at: new Date(),
        },
      });
      res.json(updatedUsage);
    } else {
      const newUsage = await prisma.emojiUsage.create({
        data: {
          emoji_id: emojiId,
          usage_count: 1,
          last_used_at: new Date(),
        },
      });
      res.json(newUsage);
    }
  } catch (error) {
    console.error("Failed to update emoji usage:", error);
    res.status(500).send("Failed to update usage.");
  }
});

async function updateEmojiUsage(emojiId) {
  const existingUsage = await prisma.emojiUsage.findUnique({
    where: { emoji_id: emojiId },
  });

  if (existingUsage) {
    return await prisma.emojiUsage.update({
      where: { emoji_id: emojiId },
      data: {
        usage_count: { increment: 1 },
        last_used_at: new Date(),
      },
    });
  } else {
    return await prisma.emojiUsage.create({
      data: {
        emoji_id: emojiId,
        usage_count: 1,
        last_used_at: new Date(),
      },
    });
  }
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
