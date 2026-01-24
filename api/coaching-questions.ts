import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = {
  runtime: 'edge',
};

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  const { stressor, somatic, energyLevel, stressLevel } = await req.json();

  // Dynamic persona based on user's energy
  const isHighStress = stressLevel > 70;
  const isLowEnergy = energyLevel < 40;
  
  let approach = "Direct and challenging.";
  if (isHighStress) approach = "Calm, grounding, and focused on safety/protection.";
  if (isLowEnergy) approach = "Gentle, focused on the smallest possible step.";

  const systemPrompt = `You are an expert NLP Coach (Energy Leadership Master).
  
  CLIENT PROFILE:
  - Situation: "${stressor}"
  - Somatic Feeling: "${somatic}"
  - Internal Weather: Energy ${energyLevel}/100, Stress ${stressLevel}/100
  - Your Approach Mode: ${approach}

  TASK:
  Generate exactly 3 surgical coaching questions to shift their perspective.
  
  CRITICAL RULES:
  1. You MUST reference their specific situation ("${stressor}") or body part ("${somatic}") in at least one question.
  2. Do NOT ask generic questions like "What would love do?"
  3. Question 1 should validate the feeling.
  4. Question 2 should challenge the assumption.
  5. Question 3 should provoke a micro-action.
  6. Return ONLY a JSON array of strings.`;

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      prompt: "Generate the 3 questions now.",
    });

    const cleanText = text.replace(/```json|```/g, '').trim();
    return new Response(JSON.stringify({ questions: JSON.parse(cleanText) }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("AI Error:", error);
    // Smart fallback that uses their specific words even if AI fails
    return new Response(JSON.stringify({ 
      questions: [
        `What is the "${somatic}" trying to protect you from?`,
        `If the weight of "${stressor}" was 10% lighter, what would you do differently?`,
        "What is one thing you are pretending not to know?"
      ] 
    }), { headers: { 'Content-Type': 'application/json' } });
  }
}