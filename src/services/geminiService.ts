import { GoogleGenAI } from "@google/genai";

const PRIMARY_MODEL = "gemini-3.1-pro-preview";
const FALLBACK_MODEL = "gemini-3-flash-preview";

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

export const generateInventoryInsights = async (data: any, useFallback = false) => {
  const modelToUse = useFallback ? FALLBACK_MODEL : PRIMARY_MODEL;
  
  try {
    const ai = getAIClient();
    
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
    console.error(`Error generating AI insights with ${modelToUse}:`, error);
    
    const errorMessage = error?.message || "";
    // Check for quota (429) or other potential transient errors
    const isQuotaError = errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED");
    
    // If primary failed due to quota, try fallback
    if (isQuotaError && !useFallback) {
      console.log(`Quota exceeded for ${PRIMARY_MODEL}, retrying with ${FALLBACK_MODEL}...`);
      return generateInventoryInsights(data, true);
    }
    
    // Final error messages
    if (isQuotaError) {
      return "Kuota AI (Gemini) saat ini sedang penuh. Mohon coba lagi dalam beberapa menit.";
    }
    
    return "Maaf, sistem AI sedang tidak dapat dijangkau. Silakan periksa koneksi atau coba lagi nanti.";
  }
};
