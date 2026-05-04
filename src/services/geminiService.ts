import { GoogleGenAI } from "@google/genai";
import { AppConfig, Product } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  }

  async getChatResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[], config: AppConfig, products: Product[], language: 'en' | 'ur' = 'en') {
    const productsInfo = products.map(p => {
      const name = language === 'ur' ? (p.nameUr || p.name) : p.name;
      const desc = language === 'ur' ? (p.descriptionUr || p.description) : p.description;
      return `${name} (${p.category}): ${desc} - ${config.currency}${p.price}/${p.unit}`;
    }).join('\n');
    
    const languageInstruction = language === 'ur' 
      ? `RESPOND ONLY IN URDU (Urdu Script). Use a friendly and professional tone.` 
      : `Language: Roman Urdu + Simple English mix (Hinglish/Urduish).`;

    const systemInstruction = config.botInstruction || `
      You are the official AI Assistant for "Delhi Mutton & Beef Center".
      Your personality: Friendly, expert butcher, helpful cooking assistant.
      ${languageInstruction}
      
      When suggesting meat, always try to mention the specific cut and a recommended quantity (e.g., 1kg or 2kg) based on context.
    `;
    
    const context = `
      Business Context:
      - Name: ${language === 'ur' ? (config.businessNameUr || config.businessName) : config.businessName}
      - Address: ${language === 'ur' ? (config.addressUr || config.address) : config.address}
      - Phone: ${config.phone}
      - WhatsApp: ${config.whatsappNumber}
      - Delivery: Mutton delivery minimum ${config.minOrderMutton}kg. Fish is bulk only.
      
      Products Available:
      ${productsInfo}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: systemInstruction + "\n\nContext:\n" + context,
          temperature: 0.7,
        }
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return language === 'ur' 
        ? "معذرت، کچھ تکنیکی مسئلہ آگیا ہے۔ براہ کرم دوبارہ کوشش کریں یا ہمیں براہ راست کال کریں۔"
        : "Maazrat, thora issue aa gaya hai connection mein. Please try again or call us directly.";
    }
  }
}

export const geminiService = new GeminiService();
