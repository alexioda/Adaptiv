import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = {
  runtime: 'edge',
};

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { stressor, truth, action, fear } = await req.json();

    const systemPrompt = `Act as a world-class performance coach writing a battle cry — not a journal entry.
Inputs: Stressor: "${stressor}" | Hidden Fear: "${fear}" | New Truth: "${truth}" | Commitment: "${action}"
Guidelines:
- First person ("I"). Under 60 words.
- Open with a declaration of power, not an observation.
- Use active, muscular language. No passive voice.
- Must contain one moment of defiance — the person rejecting the old pattern.
- End with the commitment as an unbreakable seal.
- NO therapy language. NO jargon. Sound like a warrior who has just won a battle.
Output ONLY the decree text. Nothing else.`;

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
