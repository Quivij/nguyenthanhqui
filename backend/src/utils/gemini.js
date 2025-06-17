// utils/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.AIzaSyAwiCW9bJ_NHycomkMH9lpOsIOfQ0gQYvM
);

async function askGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("❌ Lỗi gọi Gemini:", error);
    return null;
  }
}

module.exports = { askGemini };
