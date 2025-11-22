import { GoogleGenAI, Type } from "@google/genai";
import { Contact, Interaction } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

// 1. Enrich Contact Data from raw text
export const enrichContactData = async (rawText: string): Promise<Partial<Contact>> => {
  const ai = getAiClient();
  
  const prompt = `
    Analyze the following raw text (which might be a LinkedIn bio, email signature, or notes) and extract contact details.
    Return a JSON object with suggested fields.
    
    Raw Text:
    "${rawText}"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          firstName: { type: Type.STRING },
          lastName: { type: Type.STRING },
          title: { type: Type.STRING },
          companyName: { type: Type.STRING },
          email: { type: Type.STRING },
          location: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  const text = response.text;
  if (!text) return {};
  return JSON.parse(text);
};

// 2. Suggest Next Step / Draft Email
export const generateEngagementSuggestion = async (contact: Contact, recentInteractions: Interaction[]) => {
  const ai = getAiClient();

  const historyContext = recentInteractions.slice(0, 5).map(i => 
    `- ${i.date} (${i.type}): ${i.notes}`
  ).join("\n");

  const prompt = `
    You are an expert sales assistant. 
    Contact: ${contact.firstName} ${contact.lastName}, ${contact.title}
    Last Contacted: ${contact.lastContacted || 'Never'}
    
    Recent History:
    ${historyContext}

    Task:
    1. Analyze the relationship health.
    2. Suggest a specific "Next Step" (e.g., Send article about X, Ask for coffee).
    3. Draft a short, personalized email for that next step.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          healthScore: { type: Type.INTEGER, description: "0-100 score based on frequency" },
          suggestion: { type: Type.STRING },
          emailDraft: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text;
  if (!text) return null;
  return JSON.parse(text);
};