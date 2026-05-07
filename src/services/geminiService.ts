import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-3.1-pro-preview";

// Lazy initialize the AI client
let aiClient: any = null;

const getAIClient = () => {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in the environment.");
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiClient;
};

export const generateInventoryInsights = async (data: any, retryWithFlash = true) => {
  try {
    const ai = getAIClient();
    const modelToUse = retryWithFlash ? MODEL_NAME : "gemini-1.5-flash";
    
    const prompt = `
      As a smart financial advisor for a retail store, analyze the following business data and provide 3-4 concise, actionable insights in Indonesian (Bahasa Indonesia).
      Focus on stock management, profitability, and revenue trends.
      
      Business Data:
      - Total Sales: ${data.totalSales}
      - Total Profit: ${data.totalProfit}
      - Total Expenses: ${data.totalExpenses}
      - Low Stock Count: ${data.lowStockCount}
      - Top Selling Products: ${JSON.stringify(data.topProducts)}
      
      Format the response as clear bullet points. Keep it professional and motivating.
    `;

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error: any) {
    console.error(`Error generating AI insights with ${retryWithFlash ? MODEL_NAME : "gemini-1.5-flash"}:`, error);
    
    const errorMessage = error?.message || "";
    const isQuotaError = errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED");
    
    if (isQuotaError && retryWithFlash) {
      console.log("Quota exceeded for Pro model, retrying with Flash model...");
      return generateInventoryInsights(data, false);
    }
    
    if (isQuotaError) {
      return "Kuota AI telah habis (Limit 429). Mohon tunggu beberapa saat sebelum mencoba lagi.";
    }
    
    return "Maaf, gagal memuat insight AI saat ini. Silakan periksa koneksi internet atau kunci API Anda.";
  }
};
