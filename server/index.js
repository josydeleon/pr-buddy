import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Anthropic } from "@anthropic-ai/sdk";

dotenv.config();

const app = express();

const PORT = process.env.SERVER_PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY,
});

// AI Analysis Endpoint
app.post("/api/analyze", async (req, res) => {
  const { prTitle, prDescription, diff, systemPrompt, additionalContext } = req.body;

        if (!process.env.VITE_ANTHROPIC_API_KEY) {
            return res
                .status(500)
                .json({ error: "Anthropic API Key not configured on server" });
        }

        const finalSystemPrompt = additionalContext
    ? `${systemPrompt}\n\nHere is additional context provided by the user:\n${additionalContext}`
    : systemPrompt;

        const prompt = `
        ${finalSystemPrompt}

        Review the following Pull Request:

Title: ${prTitle}
Description: ${prDescription}

Diff:
${diff.substring(0, 100000)} // Truncate to avoid token limits if necessary
`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content =
      msg.content[0].type === "text"
        ? msg.content[0].text
        : '{"internal_analysis": "Error parsing AI response", "public_review": "Error", "files_to_change": []}';

    // Attempt to parse JSON
    let result;
    try {
      // Find JSON start and end in case there's preamble
      const jsonStart = content.indexOf("{");
      const jsonEnd = content.lastIndexOf("}") + 1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = content.slice(jsonStart, jsonEnd);
        result = JSON.parse(jsonStr);
      } else {
        result = JSON.parse(content);
      }
    } catch (e) {
      console.error("Failed to parse AI JSON response", e);
      result = {
        internal_analysis: "Failed to parse JSON. Raw output below.",
        public_review: content,
        files_to_change: [],
      };
    }

    res.json(result);
  } catch (error) {
    console.error("AI Request Failed", error);
    res.status(500).json({ error: "Failed to generate review" });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
