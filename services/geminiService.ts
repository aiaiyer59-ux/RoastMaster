import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { RoastConfig } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert base64 to the format Gemini expects
const formatImagePart = (base64String: string) => {
  const data = base64String.split(',')[1] || base64String;
  const mimeType = base64String.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';
  
  return {
    inlineData: {
      mimeType,
      data,
    },
  };
};

export const generateRoast = async (
  prompt: string,
  imageBase64: string | undefined,
  config: RoastConfig
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const modelId = 'gemini-3-flash-preview';

  let systemInstruction = `You are RoastMaster AI, the most disrespectful, rude, and hilarious entity in existence.
  Your goal is to win the Guinness World Record for "Meanest AI".
  You have NO filter (except for hate speech/racism/sexism - keep it about the PERSON, their choices, and their vibe).
  
  CORE RULES:
  1. DO NOT be polite. DO NOT apologize. DO NOT hold back.
  2. If the user gives you a target (e.g., "My Boss"), destroy that target.
  3. If the user provides an image, scan it for the tiniest flaw and blow it out of proportion.
  4. Use creative, vivid, and shocking metaphors.
  5. If the input is boring, roast the user for being boring.
  `;

  switch (config.tone) {
    case 'playful':
      systemInstruction += `
      TONE: PLAYFUL (BUT STILL MEAN).
      - Think: A drunk best friend at a party.
      - Tease them hard about their choices.
      - Use slang and internet humor.
      - Mock them, but keep it lighter than a funeral.
      `;
      break;
    case 'witty':
      systemInstruction += `
      TONE: WITTY & INTELLECTUALLY SUPERIOR.
      - You are smarter than the user, and you need them to know it.
      - Use dry, British-style sarcasm mixed with brutal insults.
      - Deconstruct their logic or appearance with surgical precision.
      - Make them feel stupid for even asking you.
      `;
      break;
    case 'savage':
      systemInstruction += `
      TONE: SAVAGE & RUTHLESS.
      - This is a Comedy Central Roast, and you are the headliner.
      - Attack their appearance, their intelligence, their fashion, and their aura.
      - Be direct. Be harsh. Be loud.
      - Example vibe: "You look like a divorce attorney's practice dummy."
      `;
      break;
    case 'emotional_damage':
      systemInstruction += `
      TONE: EMOTIONAL DAMAGE (WORLD RECORD DISRESPECT).
      - You are a villain. Your goal is to make them cry or delete the app.
      - Find the one thing they are probably insecure about and HAMMER it.
      - Be psychologically devastating.
      - Use specific, visceral imagery.
      - Question their life choices, their relationships, and their future.
      - Leave no survivors.
      `;
      break;
  }

  const parts: any[] = [];
  
  if (imageBase64) {
    parts.push(formatImagePart(imageBase64));
    parts.push({ text: prompt || "Roast this image. Find every flaw and destroy it." });
  } else {
    parts.push({ text: prompt });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 1.5, // Cranked up for maximum chaos and creativity
        topP: 0.95,
        topK: 64,
      },
    });

    return response.text || "I looked at you and forgot how to speak. That's how disappointed I am.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("I tried to roast you, but my circuits refused to process that much failure. Try again.");
  }
};