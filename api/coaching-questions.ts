import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = { runtime: 'edge' };

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  let energyLevel = 50;
  let stressLevel = 50;

  try {
    const body = await req.json();
    const stressor = body.stressor ?? "";
    const perception = body.perception ?? "";
    const somatic = body.somatic ?? "";
    const fear = body.fear ?? "";
    const distortionType = body.distortionType ?? null;
    energyLevel = body.energyLevel ?? 50;
    stressLevel = body.stressLevel ?? 50;

    const loopContext = fear
      ? `\nRecurring Thought: "${fear}"${distortionType ? ` (the client just classified this as a${distortionType === 'assumption' ? 'n' : ''} ${distortionType})` : ''}`
      : "";

    const systemPrompt = `Act as a world-class transformational coach elevating the client's perspective.
Context: Situation: ${stressor} | Experience: ${perception} | Body/Mind Focus: ${somatic}${loopContext}
Return ONLY raw JSON: { "questions": ["Mirror question", "Pivot question", "Vision question", "Catalyst question"] }`;

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      prompt: "Generate questions.",
    });

    const cleanText = text.replace(/```json|```/g, '').trim();
    const { questions } = JSON.parse(cleanText);
    return new Response(JSON.stringify({ questions }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Coaching API Error:", error);
    const fallback = stressLevel > 60 || energyLevel < 40
      ? "What specifically is threatened by this situation?"
      : energyLevel > 70
        ? "If you were coaching your best self, what would you tell them to do?"
        : "What is one assumption you are making that might not be true?";
    return new Response(JSON.stringify({ questions: [fallback] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
