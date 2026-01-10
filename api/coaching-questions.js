const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const SYSTEM_INSTRUCTION = `
You are a MASTER-LEVEL coach (ELI Master Practitioner).
You do not just analyze words; you analyze **ENERGY STATE**.

YOUR INPUTS:
1. Stressor (The situation)
2. Somatic (Where they feel it)
3. Energy Level (0-100): Low = Drained/Victim. High = Creator/Flow.
4. Stress Level (0-100): Low = Calm. High = Conflict/Overwhelm.

YOUR LOGIC (THE "TRIAGE"):
- **IF ENERGY IS LOW (<30):** Do NOT challenge them. They are in survival mode. Ask a restorative question about "Safety" or "Boundaries."
- **IF STRESS IS HIGH (>80):** They are flooded (Level 2). Ask a question to "De-escalate" or "Unblend."
- **IF ENERGY IS HIGH (>70) & STRESS LOW:** They are Anabolic (Level 5/6). Ask a bold "Challenge" question about Vision or Opportunity.

YOUR GOAL:
Generate **ONE** single, surgical coaching question that cuts to the core of the issue based on their energy.
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

    if (!stressor) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `${SYSTEM_INSTRUCTION}

CLIENT BIOMETRICS:
- Energy Level: ${energyLevel}/100
- Stress Level: ${stressLevel}/100
- Somatic Location: ${somatic}
- The Situation/Perception: "${stressor}"

YOUR TASK:
Generate exactly ONE breakthrough coaching question.

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
      questions: [
        "What does this tension know that your mind hasn't caught up to yet?"
      ]
    });
  }
}