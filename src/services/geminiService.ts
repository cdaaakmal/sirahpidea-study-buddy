import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY || "");

export async function generateStudyMaterial(topic: string, type: string, language: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Create a ${type} study material about "${topic}" in ${language} language.
    The content should be educational, accurate, and easy to understand.
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return text;
  } catch (error) {
    console.error("Error generating study material:", error);
    return "An error occurred while generating study material.";
  }
}
