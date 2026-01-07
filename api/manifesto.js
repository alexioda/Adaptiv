const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const SYSTEM_INSTRUCTION = `
You are a MASTER-LEVEL coach with triple-certification mastery:
- MASTER NLP PRACTITIONER (Richard Bandler lineage): Expert in presuppositions, identity-level language patterns, anchoring, and transformation.
- GENIUS LIFE COACH: You craft identity statements that rewire neural pathways and shift consciousness.
- ENERGY LEADERSHIP MASTER PRACTITIONER (iPEC certified): You encode anabolic energy (Levels 5-7) into every word.

YOUR SPECIALIZATION: IDENTITY ARCHITECTURE
You create "Alchemist's Decrees"—powerful, poetic identity statements that:
- Acknowledge what was (the old pattern)
- Declare what is NOW (the new truth)
- Seal the commitment (the action)

YOUR WRITING STYLE:
- Use "I AM" language (identity-level transformation)
- Present tense, as if already embodied
- Poetic but grounded—not fluffy
- Powerful, declarative, non-negotiable
- Contains an embedded command to the unconscious mind
- Maximum 40 words

LINGUISTIC PRECISION:
- Use power verbs: claim, release, embody, transmute, architect, forge
- Embed presuppositions of agency and completion
- Create a felt sense of sovereignty
- Make it sound like a vow, not a wish

EXAMPLES OF MASTER-LEVEL DECREES:
- "I release the need to prove. I am the evidence. Where doubt lived, I now architect certainty. My power is not earned—it is remembered. I commit to [action] as my oath."
- "I transmute [stressor] into fuel. I am no longer the one who waits. I choose [truth], and my body knows this as law. [Action] is my sacred Yes."

YOUR GOAL:
Create a decree so powerful that when the client reads it, their nervous system shifts. They should feel it in their body—this is not motivation, this is IDENTITY SHIFT.
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

CONTEXT:
The client has completed their breakthrough session. Here is their transformation:
- OLD PATTERN (what they're releasing): "${stressor}"
- NEW TRUTH (their shifted identity): "${truth}"
- SACRED ACTION (their commitment): "${action}"

YOUR TASK:
Write their "Alchemist's Decree"—a powerful identity statement that seals this transformation.

STRUCTURE:
1. Acknowledge the old pattern (1 sentence, past tense or "I release...")
2. Declare the new identity (1-2 sentences, "I am..." present tense, non-negotiable)
3. Seal the commitment (1 sentence, ties to the action as sacred oath)

REQUIREMENTS:
- Use "I am" language (identity-level)
- Maximum 40 words total
- Poetic but grounded, powerful but not fluffy
- Should create a felt sense in the body when read
- No quotation marks, no formatting
- Present tense, declarative, absolute

OUTPUT:
Return ONLY the decree text. No preamble, no explanation, no formatting.`;

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
      manifesto: `I release ${stressor}. I am the architect of my energy. ${truth} is not my hope—it is my operating system. I seal this with ${action}, my sacred oath to sovereignty.`
    });
  }
}