import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = { runtime: 'edge' };

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  const { level, type } = await req.json();
  const systemPrompt = `You are a Master Coach. Input: Level ${level} (${type}). Task: Generate a ONE-sentence "Power Shift" insight.`;

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      prompt: "Generate insight.",
    });
    return new Response(JSON.stringify({ insight: text }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ insight: "Your energy is your currency." }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}