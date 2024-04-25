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

        await fetch("/save-emoji", {
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
  const emojiName = document
    .getElementById("emojiDisplay")
    .getAttribute("data-current-name");
  sendEmojiReaction(emojiName, "like");
  addEmojiToReactionList(emojiHtml, emojiName, "Liked");
});

document.getElementById("dislike").addEventListener("click", function () {
  const emojiHtml = document
    .getElementById("emojiDisplay")
    .getAttribute("data-current-emoji");
  const emojiName = document
    .getElementById("emojiDisplay")
    .getAttribute("data-current-name");
  sendEmojiReaction(emojiName, "dislike");
  addEmojiToReactionList(emojiHtml, emojiName, "Disliked");
});

async function sendEmojiReaction(emojiHtml, reactionType) {
  try {
    const response = await fetch("/emoji-reaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emojiHtml, reactionType }),
    });
    if (!response.ok) throw new Error("Failed to send reaction");
    console.log(`Reaction ${reactionType} sent for ${emojiHtml}`);
  } catch (error) {
    console.error("Error sending reaction:", error);
  }
}
