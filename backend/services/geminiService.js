// AI auto-categorisation: asks Google Gemini which category an expense belongs to.
const { GoogleGenAI } = require("@google/genai");
const CATEGORIES = require("../config/categories");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function categorizeExpense(description) {
  const prompt = `
You are an expense categorization assistant.
Categorize the following expense into exactly ONE of these categories:
${CATEGORIES.join(", ")}

Expense description: "${description}"

Return ONLY the category name. No explanation.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  const category = response.text.trim();

  // Only accept a valid category, otherwise fall back to "Other"
  return CATEGORIES.includes(category) ? category : "Other";
}

module.exports = { categorizeExpense };
