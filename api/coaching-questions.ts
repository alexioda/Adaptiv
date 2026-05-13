import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = {
  runtime: 'edge',
};

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { stressor, somatic, energyLevel, stressLevel } = await req.json();

    // Contextual Logic
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

    TASK: Generate exactly 3 surgical coaching questions.
    RULES:
    1. You MUST reference the specific situation ("${stressor}") or sensation ("${somatic}") in the questions.
    2. Question 1: Validate the feeling.
    3. Question 2: Challenge the assumption.
    4. Question 3: Provoke a micro-action.
    5. Return ONLY a JSON array of strings.`;

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