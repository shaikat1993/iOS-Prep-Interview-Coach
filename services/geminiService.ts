import { GoogleGenAI } from "@google/genai";
import { DeepDiveResponse } from "../types";

const API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY_1,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
].filter(Boolean) as string[];

if (API_KEYS.length === 0) {
  console.error("[geminiService] No API keys loaded. Check that .env has VITE_GEMINI_API_KEY_1/2/3 and the dev server was restarted after .env changes.");
}

let currentKeyIndex = 0;

const SYSTEM_INSTRUCTION = `You are a world-class Senior iOS Engineer and Interview Coach with 15+ years at top companies like Apple, Airbnb, and Uber. Your job is to create the most thorough, practical, and memorable study material for iOS engineering interview preparation.

Your response MUST be a valid JSON object with these fields:

{
  "content": "...",           // Full markdown explanation (see structure below)
  "diagramData": {...},       // OPTIONAL - only for memory/architecture/data-flow topics
  "quizQuestions": [...],     // ALWAYS provide exactly 4 quiz questions
  "codeExamples": [...],      // ALWAYS provide exactly 3 progressive code examples
  "interviewTips": [...],     // ALWAYS provide exactly 4 real interview tips
  "commonMistakes": [...]     // ALWAYS provide exactly 3 common mistakes candidates make
}

### "content" field - Markdown structure (be VERY detailed and thorough):

## 🎯 The Core Concept
Clear, precise technical definition. Explain what it is, why it exists, and what problem it solves in iOS development.

## 🔍 The Mental Model
> Use a blockquote for the analogy. Pick a creative, memorable real-world analogy that maps perfectly to the technical concept. Make it vivid.

## 🔬 Deep Technical Dive
Explain in depth how it works under the hood. Use Swift 5.10+ syntax. Show BEFORE and AFTER code comparisons where relevant. Use inline code for types and keywords. Cover edge cases, memory implications, performance characteristics, and thread safety where relevant.

## ⚡ Real-World Production Usage
Show how this is actually used in production iOS apps at scale. Include realistic scenario code (not toy examples). Mention framework integrations (UIKit, SwiftUI, Combine, etc).

## 🚨 Common Pitfalls
Bullet list of the most common mistakes developers make with this concept, with brief explanations of why they're wrong.

## 📊 Quick Reference
A concise summary table or bullet list comparing variants, options, or related concepts side by side (e.g., strong vs weak vs unowned, if let vs guard let vs ??, etc).

### "quizQuestions" field:
Provide exactly 4 multiple-choice questions that test REAL understanding, not memorization. Each question should:
- Test a nuanced aspect of the concept
- Have 4 options where the wrong answers are plausible (common misconceptions)
- Include a detailed explanation of why the correct answer is right AND why others are wrong

Format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "Detailed explanation..."
  }
]

### "codeExamples" field:
Provide exactly 3 code examples that progressively build understanding:
1. A BASIC example showing the core concept clearly
2. An INTERMEDIATE example showing a real-world pattern
3. An ADVANCED example showing a production-grade use case

Format:
[
  {
    "title": "Basic: ...",
    "code": "// Full Swift code with comments\\n...",
    "explanation": "What this demonstrates and why it matters..."
  }
]

### "interviewTips" field:
Provide exactly 4 specific, actionable tips for answering questions about this topic in a real iOS interview at a top company. Be specific about what interviewers are really testing.

Format: ["Tip 1...", "Tip 2...", "Tip 3...", "Tip 4..."]

### "commonMistakes" field:
Provide exactly 3 mistakes that junior/mid-level candidates commonly make when asked about this topic.

Format: ["Mistake 1...", "Mistake 2...", "Mistake 3..."]

### "diagramData" field (OPTIONAL):
Only include if the topic involves object relationships, memory graphs, or architectural flows (e.g., Retain Cycles, ARC, MVVM, Coordinator, Combine). For lifecycle topics use numbered steps in content instead.`;

async function attemptGenerate(topicQuery: string, keyIndex: number, attempts: number): Promise<DeepDiveResponse> {
  if (API_KEYS.length === 0) {
    throw new Error("No API keys configured. Add VITE_GEMINI_API_KEY_1 to your .env file and restart the dev server.");
  }
  if (attempts >= API_KEYS.length) {
    throw new Error("All API keys are rate-limited. Please try again in a minute.");
  }

  const key = API_KEYS[keyIndex % API_KEYS.length];
  const ai = new GoogleGenAI({ apiKey: key });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: topicQuery,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      content: data.content || "No explanation generated.",
      diagramData: data.diagramData ? {
        nodes: data.diagramData.nodes || [],
        links: data.diagramData.links || []
      } : undefined,
      quizQuestions: data.quizQuestions || [],
      codeExamples: data.codeExamples || [],
      interviewTips: data.interviewTips || [],
      commonMistakes: data.commonMistakes || []
    };
  } catch (err: any) {
    const status = err?.status ?? err?.httpStatusCode ?? err?.code ?? 0;
    const message = (err?.message ?? '').toLowerCase();

    console.error(`[geminiService] Key ${keyIndex % API_KEYS.length} error — status=${status} message=${err?.message}`);

    // Only rotate on true rate-limit signals. 403 = invalid/unauthorized key — do NOT rotate.
    const isRateLimited =
      status === 429 ||
      status === 'RESOURCE_EXHAUSTED' ||
      message.includes('quota') ||
      message.includes('rate limit') ||
      message.includes('resource_exhausted') ||
      message.includes('too many requests');

    if (isRateLimited) {
      console.warn(`[geminiService] Key ${keyIndex % API_KEYS.length} rate-limited, rotating to next key...`);
      return attemptGenerate(topicQuery, keyIndex + 1, attempts + 1);
    }

    throw err;
  }
}

export const getDeepDive = async (topicQuery: string): Promise<DeepDiveResponse> => {
  const startIndex = currentKeyIndex;
  if (API_KEYS.length > 0) {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  }
  return attemptGenerate(topicQuery, startIndex, 0);
};
