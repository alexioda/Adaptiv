import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = {
  runtime: 'edge',
};

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  // Safe parsing with defaults
  const body = await req.json();
  const { stressor, truth, action, fear = "uncertainty" } = body;

  const systemPrompt = `You are an ALCHEMIST OF IDENTITY.
  Goal: Forge a "Decree" of sovereignty.
  
  TONE:
  - No jargon.
  - Poetic, Rhythmic, Ancient.
  - Authoritative ("I AM").
  - Short (Max 3 sentences).

  CONTEXT:
  - Weight: "${stressor}"
  - Fear: "${fear}"
  - Truth: "${truth}"
  - Action: "${action}"

  STRUCTURE:
  1. Acknowledge the fear briefly but dismiss its power.
  2. Claim the new truth.
  3. Seal it with the action.`;

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      prompt: "Generate the decree.",
    });

    return new Response(JSON.stringify({ manifesto: text }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Manifesto Error:", error);
    return new Response(JSON.stringify({ 
      manifesto: `I release the weight of ${stressor}. I acknowledge the fear of ${fear}, but I choose to stand in my truth: ${truth}. I seal this by ${action}.`
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}