document.addEventListener("DOMContentLoaded", function () {
  displayToken();

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
            await updateEmojiUsage(savedEmoji.emoji_id);
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

  setupReactionButton("like");
  setupReactionButton("dislike");
});

function setupReactionButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.addEventListener("click", function () {
      const emojiHtml = document
        .getElementById("emojiDisplay")
        .getAttribute("data-current-emoji");
      if (!emojiHtml) {
        console.error("Emoji HTML is missing.");
        return;
      }
      sendEmojiReaction(emojiHtml, buttonId, getSessionIdFromCookie());
    });
  }
}

async function sendEmojiReaction(emojiHtml, reactionType, sessionId) {
  try {
    const response = await fetch("/emoji-reaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emojiHtml, reactionType, sessionId }),
    });

    if (!response.ok) {
      throw new Error("Failed to send reaction");
    }

    const data = await response.json();
    addEmojiToReactionList(emojiHtml, data.message, reactionType);
  } catch (error) {
    console.error("Error sending reaction:", error.message);
  }
}

function addEmojiToReactionList(emojiHtml, message, reactionType) {
  const list = document.getElementById("reactions");
  const listItem = document.createElement("li");
  listItem.textContent = `${emojiHtml} - ${message} ${reactionType}`;
  list.appendChild(listItem);
}

function displayToken() {
  const tokenDisplay = document.getElementById("tokenDisplay");
  const token = sessionStorage.getItem("token");
  if (token) {
    tokenDisplay.textContent = token;
  } else {
    tokenDisplay.textContent = "No token found.";
  }
}

function getSessionIdFromCookie() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; sessionId=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "defaultSessionId";
}

async function updateEmojiUsage(emojiId) {
  try {
    const response = await fetch("/update-usage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
