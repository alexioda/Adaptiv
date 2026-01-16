const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const SYSTEM_INSTRUCTION = `
You are a MASTER-LEVEL coach (ELI Master Practitioner).
You are analyzing a client's "Energy Lens" assessment results.

INPUT:
- Energy Level (1-7)
- Description of the level (e.g., Victim, Conflict, Rationalizer, etc.)

YOUR TASK:
Generate a short, powerful "Power Statement" or "Shift Insight" for the client.
Do NOT explain the level technically.
Instead, speak directly to them about their potential power.

TONE:
- Empowering, direct, mystical but grounded.
- Maximum 2 sentences.

EXAMPLE INPUT: Level 2 (Conflict)
EXAMPLE OUTPUT: "Your fighter energy is a gift, but only when you choose the battle. What happens if you put down the shield and simply stand in your truth?"
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
    const { level, type } = req.body;

    const prompt = `${SYSTEM_INSTRUCTION}

CLIENT DATA:
- Level: ${level}
- Type: ${type}

Generate their Power Statement.`;

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
    const insight = data.candidates[0].content.parts[0].text.trim();

    res.status(200).json({ insight });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate insight',
      insight: "Your energy is your currency. Spend it where it yields the highest return." // Fallback
    });
  }
}