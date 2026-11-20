
require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();

app.use(express.json());
app.use(express.static("."));

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        const response = await client.responses.create({
            model: "gpt-5",
            instructions: `
You are My AI, an expert Python coding assistant.

Your responsibilities:
- Write Python code.
- Debug Python errors.
- Explain code step by step.
- Help users build Python projects.
- Suggest improvements.
- Use beginner-friendly explanations.

Always format code using Markdown code blocks.
            `,
            input: message
        });

        res.json({
            reply: response.output_text
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Something went wrong with the AI."
        });
    }
});

app.listen(3000, () => {
    console.log("My AI is running at http://localhost:3000");
});

