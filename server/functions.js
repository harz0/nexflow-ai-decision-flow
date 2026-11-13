
import { inngest } from "./inngest.js";
import { getDecision } from "./ai.js";
import { resolvePendingResult } from "./results.js";

export const executeDecision = inngest.createFunction(
  {
    id: "execute-ai-decision",
    name: "Execute AI Decision",
    triggers: {
      event: "workflow/decision.requested",
    },
  },
  async ({ event, step }) => {
    const { requestId, prompt } = event.data;

    const result = await step.run("evaluate-decision", async () => {
      return await getDecision(prompt);
    });

    resolvePendingResult(requestId, result);

    return result;
  }
);
