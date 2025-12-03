import { ChatAnthropic } from "@langchain/anthropic";

export const createLLM = () => {
  return new ChatAnthropic({
    modelName: "claude-sonnet-4-20250514",
    temperature: 0.7,
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
};
