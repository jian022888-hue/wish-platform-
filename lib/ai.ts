import OpenAI from "openai";

export const ai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const AI_MODEL = "deepseek-v4-0324";
