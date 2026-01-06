import { GoogleGenAI } from "@google/genai";
import { GameResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMatchCommentary = async (result: GameResult, isVictory: boolean): Promise<string> => {
  try {
    const prompt = `
      You are an intense fighting game announcer.
      The match just ended.
      Outcome: ${isVictory ? "PLAYER VICTORY" : "PLAYER DEFEAT"}.
      Stats:
      - Time: ${result.timeElapsed} seconds
      - Damage Dealt: ${result.damageDealt}
      - Health Remaining: ${result.finalHealth}%
      - Max Combo: ${result.maxCombo}x

      Generate a short, hype, one-sentence commentary line about this performance.
      If victory, praise the technique. If defeat, encourage them to stand up again.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || (isVictory ? "Outstanding performance!" : "Get up and fight again!");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return isVictory ? "A glorious victory!" : "Defeat is just a lesson.";
  }
};
