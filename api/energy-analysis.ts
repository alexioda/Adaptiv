import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = {
  runtime: 'edge',
};

const google = createGoogleGenerativeAI({
  apiKey: (globalThis as any).GEMINI_API_KEY ?? (globalThis as any).GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { level, type } = await req.json();

    const systemPrompt = `You are a Master Coach analyzing an Energy Leadership assessment.
    Input: Level ${level} (${type}).
    
    Task: Generate a ONE-sentence "Power Shift" insight.
    Tone: Mystical but grounded. Direct.`;

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      prompt: "Generate insight.",
    });

    return new Response(JSON.stringify({ insight: text }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Energy API Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to analyze energy' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
