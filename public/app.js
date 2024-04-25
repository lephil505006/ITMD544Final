document
  .getElementById("generateRandomEmoji")
  .addEventListener("click", async () => {
    try {
      const response = await fetch("/random-emoji");
      const emojiData = await response.json();
      if (response.ok) {
        const emojiHtml = emojiData.htmlCode[0];
        document.getElementById("emojiDisplay").innerHTML = emojiHtml;
        document
          .getElementById("emojiDisplay")
          .setAttribute("data-current-emoji", emojiHtml);
        document
          .getElementById("emojiDisplay")
          .setAttribute("data-current-name", emojiData.name);

        const saveResponse = await fetch("/save-emoji", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: emojiData.name,
            htmlCode: emojiHtml,
            unicode: emojiData.unicode,
            category: emojiData.category,
            group: emojiData.group,
          }),
        });

        if (saveResponse.ok) {
          const savedEmoji = await saveResponse.json();
          const usageUpdated = await updateEmojiUsage(savedEmoji.emoji_id);
          console.log("Usage updated:", usageUpdated);
        }
      } else {
        document.getElementById("emojiDisplay").textContent =
          "Failed to fetch random emoji";
      }
    } catch (error) {
      console.error("Failed to fetch random emoji:", error);
      document.getElementById("emojiDisplay").textContent =
        "Error in fetching random emoji";
    }
  });

function getSessionIdFromCookie() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; sessionId=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "defaultSessionId";
}

function addEmojiToReactionList(emojiHtml, emojiName, reactionType) {
  const list = document.getElementById("reactions");
  const listItem = document.createElement("li");
  listItem.innerHTML = `${emojiHtml} - ${emojiName} ${reactionType}`;
  list.appendChild(listItem);
}

document.getElementById("like").addEventListener("click", function () {
  const emojiHtml = document
    .getElementById("emojiDisplay")
    .getAttribute("data-current-emoji");
  const sessionId = getSessionIdFromCookie();
  if (!emojiHtml) {
    console.error("Emoji HTML is missing.");
    return;
  }
  sendEmojiReaction(emojiHtml, "like", sessionId);
});

document.getElementById("dislike").addEventListener("click", function () {
  const emojiHtml = document
    .getElementById("emojiDisplay")
    .getAttribute("data-current-emoji");
  const sessionId = getSessionIdFromCookie();
  if (!emojiHtml) {
    console.error("Emoji HTML is missing.");
    return;
  }
  sendEmojiReaction(emojiHtml, "dislike", sessionId);
});

async function sendEmojiReaction(emojiHtml, reactionType, sessionId) {
  try {
    const response = await fetch("/emoji-reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emojiHtml, reactionType, sessionId }),
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      throw new Error("Failed to send reaction: " + errorResponse);
    }

    const data = await response.json();
    console.log("Reaction sent successfully:", data.message);
  } catch (error) {
    console.error("Error sending reaction:", error.message);
  }
}

async function updateEmojiUsage(emojiId) {
  try {
    const response = await fetch("/update-usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emojiId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update usage: ${errorText}`);
    }

    const data = await response.json();
    console.log("Usage updated:", data);
  } catch (error) {
    console.error("Error updating usage:", error.message);
  }
}
