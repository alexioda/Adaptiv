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
    const { stressor, truth, action, fear } = await req.json();

    const systemPrompt = `You are an ALCHEMIST OF IDENTITY.
    Goal: Forge a "Decree" of sovereignty.
    Tone: Poetic, Rhythmic, Ancient. Authoritative ("I AM"). Short (Max 3 sentences).
    
    Context:
    - Weight: "${stressor}"
    - Fear: "${fear}"
    - Truth: "${truth}"
    - Action: "${action}"

    Structure:
    1. Acknowledge the fear briefly but dismiss its power.
    2. Claim the new truth.
    3. Seal it with the action.`;

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      prompt: "Generate the decree.",
    });

    return new Response(JSON.stringify({ manifesto: text }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Manifesto API Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to generate manifesto' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
