import { GoogleGenerativeAI } from "@google/generative-ai";

// Pastikan Syahida dah letak API Key dalam environment
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY || "");

export async function generateStudyMaterial(topic: string, type: string, language: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prompt gabungan — boleh auto cipta nota, kuiz, atau isi ikut jenis
    const prompt = `
    Create a ${type} study material about "${topic}" in ${language} language.
    The content should be educational, accurate, and easy to understand.
    `;

    const result = await model.generateContent(prompt);

    // Return hasil text sahaja
    return result.response.text();
  } catch (error) {
    console.error("Error generating study material:", error);
    return "Sorry, something went wrong while generating content.";
  }
}
