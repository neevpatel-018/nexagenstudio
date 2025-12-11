import { GoogleGenAI } from "@google/genai";
import { CodeLanguage } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const executeCode = async (code: string, language: CodeLanguage): Promise<string> => {
  try {
    const ai = getClient();
    
    const prompt = `
      You are a code execution engine. 
      Language: ${language}
      Code:
      ${code}

      Task: Simulate the execution of this code and return ONLY the standard output (stdout). 
      If there is a syntax error or runtime error, return the error message.
      Do not add markdown formatting (like \`\`\`) around the output. Just raw text output.
      If the code implies a graphical output or UI, describe what would happen briefly in text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text?.trim() || "No output returned.";
  } catch (error: any) {
    console.error("Gemini Execution Error:", error);
    return `Error executing code: ${error.message || "Unknown error"}`;
  }
};

export const generateReflectionParams = async (todos: string[]): Promise<string> => {
   try {
    const ai = getClient();
    const prompt = `
      I have completed the following tasks today:
      ${todos.join(', ')}

      Give me a short, encouraging 1-sentence reflection prompt based on these tasks to help me plan for tomorrow.
    `;
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text?.trim() || "What is your main focus for tomorrow?";
   } catch (e) {
     return "What is your main focus for tomorrow?";
   }
}
