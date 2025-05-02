// This file provides a Gemini API call wrapper for complaint classification.
// You must set your Gemini API key in .env as REACT_APP_GEMINI_KEY

export async function classifyComplaint(text) {
  const apiKey = process.env.REACT_APP_GEMINI_KEY;
  if (!apiKey) throw new Error('Gemini API key missing');

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey;
  const prompt = `Classify the following citizen complaint into a department: "${text}". Departments: Water Department, Public Works Department, Electricity Department, General Administration. Respond with only the department name.`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text.trim();
  }
  throw new Error('Classification failed');
}
