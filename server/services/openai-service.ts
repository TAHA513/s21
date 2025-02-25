
import OpenAI from "openai";
import { logger } from "../db";

export class OpenAIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey
    });
  }

  async getResponse(userMessage: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: userMessage }],
        max_tokens: 500,
      });

      return response.choices[0].message.content || "عذراً، لم أستطع فهم الرسالة";
    } catch (error) {
      logger.error("OpenAI API error:", error);
      throw new Error("حدث خطأ في معالجة الرسالة");
    }
  }
}

let openaiService: OpenAIService | null = null;

export function initializeOpenAI(apiKey: string) {
  openaiService = new OpenAIService(apiKey);
  return openaiService;
}

export function getOpenAIService() {
  if (!openaiService) {
    throw new Error("OpenAI service not initialized");
  }
  return openaiService;
}
