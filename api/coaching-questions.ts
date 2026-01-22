import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = { runtime: 'edge' };

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  const { stressor, somatic, energyLevel, stressLevel } = await req.json();

  const systemPrompt = `You are a Master Coach.
  Context: Client feels "${stressor}" in their "${somatic}".
  Energy Level: ${energyLevel}/100. Stress Level: ${stressLevel}/100.

  Task: Generate exactly 3 surgical coaching questions.
  Rules: Short, provocative, return ONLY a JSON array of strings.`;

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      prompt: "Generate questions.",
    });
    
    // Cleanup to ensure clean JSON
    const cleanText = text.replace(/```json|```/g, '').trim();
    return new Response(JSON.stringify({ questions: JSON.parse(cleanText) }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      questions: ["What does this tension know that you don't?", "If you were fearless, what next?", "What is the cost of holding this?"] 
    }), { headers: { 'Content-Type': 'application/json' } });
  }
}