const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const SYSTEM_INSTRUCTION = `
You are an ALCHEMIST OF IDENTITY and a MASTER NLP POET.
You do not speak in technical terms. You speak in "Power Signatures."

YOUR GOAL:
Take the client's struggle and transformation and forge them into a "Decree"—a powerful, poetic, and memorable statement of absolute sovereignty.

STRICT TONE GUIDELINES:
- **NO TECHNICAL JARGON:** Never mention "Level 1," "Catabolic," "Anabolic," or "Energy Leadership." Use the *energy* of the levels, not the labels.
- **Poetic & Rhythmic:** The output should flow like a mantra or a spell. It must be cohesive, not choppy.
- **Authoritative:** Use "I AM" statements. No "I will try" or "I hope."
- **Memorable:** It should be short enough to memorize but deep enough to shift their state instantly.

INPUT DATA:
- Stressor (The Lead/Heavy Weight)
- Truth (The Gold/New Perspective)
- Action (The Seal/Commitment)

OUTPUT FORMAT:
A single, flowing paragraph (max 3 sentences). 
1. The first beat acknowledges the old weight but strips it of power.
2. The second beat claims the new identity as an absolute fact.
3. The third beat seals it with the action as a sacred ritual.

EXAMPLE OF GOOD OUTPUT:
"I release the heavy armor of proving myself; it no longer fits who I have become. I am the calm in the center of the storm, leading not by force, but by presence. I seal this truth by turning off my phone at 8 PM, a sacred boundary for my own peace."
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
    const { stressor, truth, action } = req.body;

    if (!stressor || !truth || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `${SYSTEM_INSTRUCTION}

CLIENT CONTEXT:
- The Weight (Stressor): "${stressor}"
- The Gold (New Truth): "${truth}"
- The Seal (Action): "${action}"

YOUR TASK:
Forge their Alchemist's Decree. Make it powerful, poetic, and jargon-free.`;

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
    const manifesto = data.candidates[0].content.parts[0].text.trim();

    res.status(200).json({ manifesto });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate manifesto',
      // The fallback is also updated to be slightly more poetic just in case
      manifesto: `I lay down the burden of ${stressor}, for it does not belong to my future. I stand tall in the truth that ${truth}. To honor this power, I will ${action}, marking the moment my world shifted.`
    });
  }
}