import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = { runtime: 'edge' };

const google = createGoogleGenerativeAI({
  apiKey: (globalThis as any).GEMINI_API_KEY ?? (globalThis as any).GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  let stressor = "";
  let somatic = "";
  let energyLevel = 50;
  let stressLevel = 50;

  try {
    const body = await req.json();
    stressor = body.stressor ?? "";
    somatic = body.somatic ?? "";
    energyLevel = body.energyLevel ?? 50;
    stressLevel = body.stressLevel ?? 50;

    const isHighStress = stressLevel > 70;
    const isLowEnergy = energyLevel < 40;
    let approach = "Direct and challenging.";
    if (isHighStress) approach = "Calm, grounding, and focused on safety.";
    if (isLowEnergy) approach = "Gentle, focused on micro-steps.";

    const systemPrompt = `You are an expert NLP Coach.
Client Context:
- Situation: "${stressor}"
- Body Sensation: "${somatic}"
- Energy: ${energyLevel}/100 | Stress: ${stressLevel}/100
- Approach: ${approach}

TASK: Generate exactly 3 surgical coaching questions in this sequence:
1. Name the body's signal without analyzing it.
2. Collapse the assumption underneath the stressor.
3. Find the smallest version of agency available right now.

RULES:
- Reference "${stressor}" or "${somatic}" specifically in the questions.
- Do NOT label the steps. Questions should feel like a conversation, not a form.
- Return ONLY a JSON array of 3 strings.`;

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      prompt: "Generate questions.",
    });

    const cleanText = text.replace(/```json|```/g, '').trim();
    return new Response(JSON.stringify({ questions: JSON.parse(cleanText) }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Coaching API Error:", error);
    return new Response(JSON.stringify({
      questions: [
        `What is the "${somatic}" trying to tell you about ${stressor}?`,
        "If you had full permission to stop, what would you do?",
        "What is one small step that feels doable right now?"
      ]
    }), { headers: { 'Content-Type': 'application/json' } });
  }
}
