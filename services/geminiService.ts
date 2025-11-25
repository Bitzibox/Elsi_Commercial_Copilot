
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { GeneratedArtifact, ArtifactType, Language } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Text Chat Service (Gemini 3 Pro) ---

const BASE_SYSTEM_INSTRUCTION = `You are Elsi, a proactive, friendly, and strategic commercial copilot for a small business owner. 
Your goal is to help manage finances, analyze sales, and generate business documents.
You are running on Gemini 3 Pro, so use your advanced reasoning capabilities.
When asked to create a document, quote, or plan, act as a professional consultant.
If the user asks for a specific business artifact (Quote, Plan, Table), provide the data in JSON format within the response so it can be rendered visually.
All monetary values should be in Euros (€).`;

let chatSession: Chat | null = null;
let currentLanguage: Language = 'en';

export const getChatSession = (language: Language = 'en'): Chat => {
  // Reset session if language changes to ensure system instruction is updated
  if (chatSession && currentLanguage !== language) {
    chatSession = null;
  }
  currentLanguage = language;

  if (!chatSession) {
    const langInstruction = language === 'fr' 
      ? " IMPORTANT: You MUST interact in FRENCH. Translate all your outputs to French." 
      : "";

    chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION + langInstruction,
        // Using thinking config for complex business reasoning
        thinkingConfig: { thinkingBudget: 2048 }, 
      },
    });
  }
  return chatSession;
};

// Function to generate structured artifacts (mock-ish helper utilizing GenAI for structure)
export const generateArtifact = async (prompt: string, type: ArtifactType, language: Language = 'en'): Promise<GeneratedArtifact> => {
  const modelId = 'gemini-3-pro-preview';
  
  let schema;
  
  if (type === ArtifactType.QUOTE) {
      schema = {
        type: Type.OBJECT,
        properties: {
            clientName: { type: Type.STRING },
            items: { 
                type: Type.ARRAY, 
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        price: { type: Type.NUMBER }
                    }
                }
            },
            total: { type: Type.NUMBER },
            validUntil: { type: Type.STRING }
        }
      }
  } else if (type === ArtifactType.ACTION_PLAN || type === ArtifactType.REPORT) {
      schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            sections: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        heading: { type: Type.STRING },
                        content: { type: Type.STRING }
                    }
                }
            }
        }
      }
  }

  const langPrompt = language === 'fr' ? "Generate content in French." : "";

  const response = await ai.models.generateContent({
      model: modelId,
      contents: `Generate a ${type} based on this request: ${prompt}. ${langPrompt}`,
      config: {
          responseMimeType: "application/json",
          responseSchema: schema
      }
  });

  const jsonText = response.text || "{}";
  try {
      const data = JSON.parse(jsonText);
      return {
          type,
          title: data.title || `Generated ${type}`,
          data: data
      };
  } catch (e) {
      console.error("Failed to parse artifact JSON", e);
      return { type, title: "Error", data: {} };
  }
}

export const sendMessageToElsi = async (text: string, language: Language = 'en') => {
  const chat = getChatSession(language);
  const result = await chat.sendMessage({ message: text });
  return result.text;
};

// --- Live API (Gemini 2.5 Flash Native Audio) Config ---
export const LIVE_MODEL_ID = 'gemini-2.5-flash-native-audio-preview-09-2025';