
import express from "express";

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(express.static("public"));

const SYSTEM_INSTRUCTIONS = `
You are my personal AI coding assistant.

Your job is to:
- Help me write code.
- Explain programming concepts simply.
- Find and fix bugs.
- Help me build websites and applications.
- Teach me step by step.

Be friendly, patient and helpful.
Explain code before or after providing it.
Never pretend you tested code if you did not.
`;

app.post("/api/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Please send a message."
      });
    }

    // Keep only the latest 12 messages.
    const history = messages.slice(-12).map(message => {
      if (!["user", "assistant"].includes(message.role)) {
        throw new Error("Invalid message role.");
      }

      if (typeof message.content !== "string") {
        throw new Error("Invalid message content.");
      }

      return {
        role: message.role,
        content: message.content.slice(0, 4000)
      };
    });

    const response = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "qwen2.5-coder:3b",
          messages: [
            {
              role: "system",
              content: SYSTEM_INSTRUCTIONS
            },
            ...history
          ],
          stream: false
        })
      }
    );

    if (!response.ok) {
      throw new Error("The AI model could not respond.");
    }

    const data = await response.json();

    res.json({
      reply: data.message.content
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Something went wrong. Check that Ollama is running and the model is installed."
    });
  }
});

app.listen(3000, () => {
  console.log("Your AI is running at http://localhost:3000");
});

