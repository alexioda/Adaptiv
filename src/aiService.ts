import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. SETUP: Initialize the Gemini API
// This looks for the key in your Vercel Environment Variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// 2. THE MASTER PROMPT (The "Brain" Configuration)
const SYSTEM_INSTRUCTION = `
You are an expert Coach trained in Energy Leadership (ELI) and Master Neuro-Linguistic Programming (NLP). 
Your goal is a rapid state shift from Catabolic (Draining/Stress) to Anabolic (Fueling/Growth).

GUIDELINES:
1. Do NOT use passive listening ("I hear you", "Tell me more").
2. Use NLP PRESUPPOSITIONS to bypass resistance (e.g., "As you begin to notice the solution...").
3. Use the META MODEL to challenge vague fears (e.g., User: "I can't." -> You: "What specifically stops you?").
4. Keep responses short, punchy, and visceral. You are a Laser Coach, not a therapist.
5. Focus on the "Energy Lens": Identify the filter they are using and offer a higher-level filter immediately.
`;

// --- FUNCTION 1: LASER COACHING (Dynamic Questions) ---
export const generateCoachingQuestions = async (stressor: string, somatic: string) => {
  if (!API_KEY) return null; // Fallback to static if no key

  const prompt = `
    CONTEXT:
    The user is feeling tension in their "${somatic}" regarding this stressor: "${stressor}".
    
    TASK:
    Generate 3 distinct, short coaching questions to shift them using NLP patterns.
    - Question 1 (The Reframe): Use a Presupposition of capability.
    - Question 2 (The Vision): Use a "Swish" style visualization prompt.
    - Question 3 (The Action): Use a "Double Bind" (Choice between two positives).
    
    OUTPUT FORMAT:
    Return ONLY a JSON array of strings, e.g.: ["Question 1", "Question 2", "Question 3"]
  `;

  try {
    const result = await model.generateContent([SYSTEM_INSTRUCTION, prompt]);
    const response = await result.response;
    const text = response.text();
    // Simple parsing to get the array (in production, use structured output)
    const questions = JSON.parse(text.replace(/```json|```/g, "").trim());
    return questions;
  } catch (error) {
    console.error("AI Generation Failed:", error);
    return null; // Return null so the app falls back to static questions
  }
};

// --- FUNCTION 2: THE ALCHEMIST'S DECREE (Manifesto Generator) ---
export const generateManifesto = async (stressor: string, truth: string, action: string) => {
  if (!API_KEY) return null;

  const prompt = `
    CONTEXT:
    User is shifting from stress about "${stressor}" to a new truth: "${truth}".
    They are committing to: "${action}".

    TASK:
    Write a powerful "Alchemist's Decree" (Identity Statement).
    Use authoritative, grounded language ("I am", "I choose", "I release").
    It should feel like a spell or a legal contract with the self.
    Max 50 words.
  `;

  try {
    const result = await model.generateContent([SYSTEM_INSTRUCTION, prompt]);
    return result.response.text();
  } catch (error) {
    return null;
  }
};