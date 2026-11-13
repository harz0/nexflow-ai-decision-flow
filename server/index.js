
import "dotenv/config";
import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";

import { inngest } from "./inngest.js";
import { executeDecision } from "./functions.js";
import { createPendingResult } from "./results.js";

import { serve } from "inngest/express";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [executeDecision],
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "AI Decision Flow Backend is running!",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "AI Decision Flow API",
  });
});

app.post("/api/decision", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    const requestId = randomUUID();

    const resultPromise = createPendingResult(requestId);

    await inngest.send({
      name: "workflow/decision.requested",
      data: {
        requestId,
        prompt: prompt.trim(),
      },
    });

    const result = await resultPromise;

    res.json(result);
  } catch (error) {
    console.error("Workflow decision error:", error.message);

    res.status(500).json({
      error: "Failed to execute AI decision",
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
