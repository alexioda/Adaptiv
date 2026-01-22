import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const config = {
  runtime: 'edge', // <--- CRITICAL: Forces Vercel to use Edge (Standard Request/Response)
};

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  const { stressor, truth, action, fear } = await req.json();

  const systemPrompt = `You are an ALCHEMIST OF IDENTITY and a MASTER NLP POET.
  Your goal is to forge a "Decree"—a statement of absolute sovereignty.
  
  TONE RULES:
  - NO technical jargon (No "Level 1", "Catabolic").
  - Poetic, Rhythmic, Ancient.
  - Authoritative ("I AM").
  - Short (Max 3 sentences).

  INPUT CONTEXT:
  - The Weight: "${stressor}"
  - The Fear: "${fear}"
  - The New Truth: "${truth}"
  - The Seal (Action): "${action}"

  STRUCTURE:
  1. Acknowledge the fear/weight briefly but dismiss its power.
  2. Claim the new truth as an absolute fact.
  3. Seal it with the action.`;

  const result = await streamText({
    model: google('gemini-1.5-flash'),
    system: systemPrompt,
    prompt: "Generate the decree now.",
  });

  return result.toDataStreamResponse();
}