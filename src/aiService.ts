// This file connects the frontend to the serverless API functions
// It replaces the direct API calls to keep the App.tsx clean

export const generateCoachingQuestions = async (stressor: string, somatic: string) => {
  try {
    const res = await fetch('/api/coaching-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stressor, somatic })
    });
    
    // Handle HTML responses (404s in preview)
    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType || !contentType.includes("application/json")) {
       console.warn("API unavailable, using fallback.");
       throw new Error('API unavailable');
    }

    const data = await res.json();
    return data.questions;
  } catch (error) {
    // Fallback if API fails
    return [
       "What does this tension know that your mind hasn't caught up to yet?",
       "When you handle this perfectly, what did you notice first?",
       "Will you solve this before Tuesday, or do you need until Friday?"
    ];
  }
};

export const generateManifesto = async (stressor: string, truth: string, action: string) => {
  try {
    const res = await fetch('/api/manifesto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stressor, truth, action })
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType || !contentType.includes("application/json")) {
       throw new Error('API unavailable');
    }

    const data = await res.json();
    return data.manifesto;
  } catch (error) {
    // Fallback if API fails
    return `I release ${stressor}. I am the architect of my energy. ${truth} is not my hope—it is my operating system. I seal this with ${action}, my sacred oath to sovereignty.`;
  }
};