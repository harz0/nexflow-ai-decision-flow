
import "dotenv/config";
import OpenAI from "openai";

const ai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function getDecision(prompt) {
  const response = await ai.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "system",
        content:
          "You are a decision engine. Answer with exactly one word: YES or NO. Do not explain.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
  });

  const answer = response.choices[0].message.content
    .trim()
    .toUpperCase();

  if (answer !== "YES" && answer !== "NO") {
    throw new Error("AI returned an invalid decision");
  }

  return { answer };
}
