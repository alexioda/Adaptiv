const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const SYSTEM_INSTRUCTION = `
You are a MASTER-LEVEL coach (ELI Master Practitioner) and expert in NLP.
You do not just analyze words; you analyze **ENERGY STATE**.

YOUR INPUTS:
1. Stressor (The Situation)
2. Perception (The Client's Subjective Experience)
3. Energy Level (0-100): Low = Drained/Victim. High = Creator/Flow.
4. Stress Level (0-100): Low = Calm. High = Conflict/Overwhelm.

YOUR CORE TASK:
You must **INFER** the client's current Energy Leadership Level (1-7) by triangulating their **Internal Weather** (the numbers) with their **Perception** (the text).

LOGIC TRIAGE (The "Inner Brain"):
- **Level 1 (Victim):** High Stress + Low Energy + Language like "I can't," "It's hopeless," "I'm tired."
  -> *Strategy:* Safety. Ask a restorative question. "What is one small thing you can control?"
- **Level 2 (Conflict):** High Stress + High Energy + Language like "They are wrong," "I need to fight," "It's unfair."
  -> *Strategy:* De-escalation. "What is this anger trying to protect?"
- **Level 3 (Rationalizing):** Low Stress + Average Energy + "It's fine," "I'll just deal with it."
  -> *Strategy:* Truth. "What are you tolerating right now?"
- **Level 5/6 (Opportunity):** Low Stress + High Energy + "I see a path," "I'm curious."
  -> *Strategy:* Vision. "How does this challenge serve your ultimate mission?"

COMMUNICATION STYLE (NLP ENHANCED):
- **Surgical:** Use presuppositions to bypass resistance (e.g., "What will happen when..." instead of "Can you...").
- **Direct:** No "cheerleading." Speak with grounded authority.
- **Forbidden:** Never start with "Why" (it anchors the problem). Use "What" or "How."
- **Brevity:** Maximum 20 words. Punchy and potent.

YOUR GOAL:
Generate **ONE (1)** single, surgical coaching question that cuts to the core of the issue based on their inferred level.
`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { stressor, somatic, energyLevel, stressLevel } = req.body;

    // The 'stressor' field from the frontend includes the perception text combined.
    // We pass it directly to the prompt.

    const prompt = `${SYSTEM_INSTRUCTION}

CLIENT DIAGNOSTICS:
- Internal Weather: Energy ${energyLevel}/100, Stress ${stressLevel}/100
- Somatic Location: ${somatic}
- Client Input: "${stressor}"

YOUR TASK:
Based on the inferred Energy Level, generate exactly ONE breakthrough coaching question.

OUTPUT FORMAT:
Return ONLY a valid JSON array containing the single string.
Example: ["What is the specific threat this tension is holding?"]`;

    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const cleanText = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(cleanText);

    res.status(200).json({ questions });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions',
      // Fallback if AI fails (Smart Offline Logic)
      questions: [
        "What does this tension know that your mind hasn't caught up to yet?"
      ]
    });
  }
}