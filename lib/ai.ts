import OpenAI from "openai";

const getAiClient = () => {
  if (!process.env.DEEPSEEK_API_KEY) {
    return null;
  }
  return new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY,
  });
};

export const ai = getAiClient();
export const AI_MODEL = "deepseek-v4-0324";
