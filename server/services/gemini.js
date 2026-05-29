import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function buildPrompt(data) {
  const fileList = data.tree.map(f => `  ${f.type === 'tree' ? '📁' : '📄'} ${f.path}`).join('\n');

  return `You are roasting this GitHub repository. Be savage, funny, and specific — but ultimately helpful.

Repository: ${data.fullName}
Description: ${data.description}
Language: ${data.language}
Stars: ${data.stars} | Forks: ${data.forks} | Open Issues: ${data.openIssues}
Contributors: ${data.contributors}
License: ${data.license}
Last push: ${data.lastPush}
Created: ${data.createdAt}
Topics: ${data.topics.join(', ') || 'none'}
Size: ${data.size} KB

File tree (root level):
${fileList || '  (empty or inaccessible)'}

${data.readme ? `README (first 3000 chars):\n${data.readme}` : 'README: NOT FOUND — this repo is already a disaster'}

${data.packageJson ? `package.json:\n${data.packageJson}` : ''}
${data.requirements ? `requirements.txt:\n${data.requirements}` : ''}

Roast this repo in 3-4 paragraphs. Be specific about what you see (or don't see). Reference actual files, the lack of README, the commit history, stars vs quality, etc. Then give 5-8 specific, actionable improvement suggestions.`;
}

export async function generateRoast(repoData) {
  const userPrompt = buildPrompt(repoData);

  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: 'You are a brutally funny but ultimately helpful code roast comedian. You tear apart repos with wit and specificity, but every roast ends with genuine, actionable advice.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roast: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['roast', 'suggestions'],
        },
      },
    });
  } catch (err) {
    console.error('[Gemini error] status=%s name=%s message=%s', err.status, err.name, err.message?.slice(0, 300));
    if (err.status === 429 || err.message?.includes('429') || err.message?.toLowerCase().includes('quota') || err.message?.toLowerCase().includes('resource has been exhausted')) {
      const quotaErr = new Error('Gemini quota exceeded');
      quotaErr.status = 429;
      throw quotaErr;
    }
    throw err;
  }

  console.log('[Gemini response.text]', response.text?.slice(0, 300));
  try {
    return JSON.parse(response.text);
  } catch (parseErr) {
    console.error('[Gemini parse error]', parseErr.message, 'raw:', response.text?.slice(0, 500));
    throw new Error('Failed to parse Gemini response as JSON');
  }
}
