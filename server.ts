/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Essential middle-wares
app.use(express.json());

// Initialize Gemini API client lazily & gracefully handle missing credentials
const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("Warning: GEMINI_API_KEY is not configured or uses placeholder value. The application will fall back to pre-authored static tips.");
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (err) {
    console.error("Error creating GoogleGenAI instance:", err);
    return null;
  }
};

// API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    currentTime: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
  });
});

/**
 * Endpoint to generate a customized motivational reminder based on a user's fitness goal.
 */
app.post("/api/gemini/reminder", async (req, res) => {
  const { goalObj } = req.body;
  
  if (!goalObj) {
    return res.status(400).json({ error: "Goal details are required." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Graceful fallback tips
    return res.json({
      reminder: `Keep moving forward with your goal: "${goalObj.title}"! Remember, small steps lead to big habits. Log your progress today to stay in the groove!`
    });
  }

  try {
    const prompt = `You are an elite, highly supportive personal physical fitness coach and athletic psychologist. 
Generate a short, powerful, hyper-personalized daily check-in fitness reminder and specific action tip for the user.
The user's active goal is:
- Title: "${goalObj.title}"
- Category: "${goalObj.category}"
- Target Level: ${goalObj.targetValue} ${goalObj.unit}
- Current Level: ${goalObj.currentValue} ${goalObj.unit}
- Target Date: ${goalObj.targetDate}

Instruct the user with direct, conversational, and energetic phrasing. Make it highly engaging. Focus heavily on how they can hit their goal today.
Format rules:
- Keep the response short, friendly, and powerful (under 80 words).
- Provide a single actionable, tiny step they can take in the next 2 hours.
- Mention their current progress specifically.
- DO NOT use generic phrases. Be specific to the category "${goalObj.category}".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const resultText = response.text || "Every action counts! Keep moving towards your target and stay motivated today!";
    res.json({ reminder: resultText.trim() });
  } catch (error: any) {
    console.error("Error generating reminder in Gemini:", error);
    res.json({ 
      reminder: `Consistency is the blueprint for change. Keep driving towards "${goalObj.title}"! Every push, step, and healthy choice counts.`,
      error: error?.message || "Gemini api error" 
    });
  }
});

/**
 * Endpoint for conversational AI Coaching.
 */
app.post("/api/gemini/coach", async (req, res) => {
  const { messageHistory, activeGoals } = req.body;

  if (!messageHistory || !Array.isArray(messageHistory)) {
    return res.status(400).json({ error: "Message history is required." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      text: "I am ready to help you hit your fitness peaks! (Gemini API key is not configured, so I am running in local offline demo mode). Ask me about workouts, nutrition, or flexibility! To enable AI coaching, add your GEMINI_API_KEY in the Secrets panel."
    });
  }

  try {
    // Format the goals info
    const goalsSummary = activeGoals && activeGoals.length > 0 
      ? activeGoals.map((g: any) => `- "${g.title}" in category ${g.category} (Progress: ${g.currentValue}/${g.targetValue} ${g.unit})`).join("\n")
      : "The user has not logged any active goals yet.";

    const systemPrompt = `You are 'Coach Titan', an energetic, empathetic, and knowledgeable AI Fitness Coach and certified Sports Dietitian.
You are warm, encouraging, yet structured and metrics-driven. You help users reach their personal fitness goals.
Here are the user's active fitness targets for context:
${goalsSummary}

Guidelines for responding:
- Reference their active goals when highly relevant to provide tailored suggestions or training tips.
- Maintain a realistic, safety-first, scientifically backed attitude.
- Break down physical plans or habits into simple, bite-sized checklists.
- Be supportive, and maintain high visual readability by using bullet points or short paragraphs.
- Keep responses concise (under 180 words) to avoid overwhelming the user during workouts.
- Support them with quick, motivational cues.`;

    const lastUserMessage = messageHistory[messageHistory.length - 1]?.text || "";
    
    // We construct the chat or generateContent with the thread context
    // For simplicity, we feed the historic sequence directly to preserve state concisely, keeping it robust.
    const messagesPrompt: string[] = [
      systemPrompt,
      ...messageHistory.map((m: any) => `${m.sender === "user" ? "User" : "Coach Titan"}: ${m.text}`),
      "Coach Titan:"
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: messagesPrompt.join("\n\n"),
    });

    res.json({ text: response.text?.trim() || "Let's make today count! Ask me anything about workouts, diet, or recovery." });
  } catch (error: any) {
    console.error("Error in AI coach chat:", error);
    res.json({ 
      text: "Apologies, athlete! I hit a quick query hurdle. Tell me: what aspect of your conditioning or training are we tackling today?",
      error: error?.message 
    });
  }
});

/**
 * Endpoint to generate Daily Motivation widget content (Quote, Focus, Wellness Tip) based on local date.
 */
app.post("/api/gemini/motivation", async (req, res) => {
  const { dateSeed } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // Exquisitely crafted static daily fallbacks
    const fallbackMotivations = [
      {
        quote: "Success isn't always about greatness. It's about consistency. Daily consistent hard work leads to success.",
        author: "Dwayne Johnson",
        focusOfTheDay: "Engage your core with 3 minutes of active planks after your morning stretches.",
        wellnessTip: "Hydrate immediately upon waking. Drink 300ml of water before your first coffee."
      },
      {
        quote: "The only place where success comes before work is in the dictionary.",
        author: "Vidal Sassoon",
        focusOfTheDay: "Focus on tempo control. Count to three on muscular lengthening phases today.",
        wellnessTip: "Take 5 slow breaths between screen sessions to decrease adrenaline levels."
      },
      {
        quote: "Progress, not perfection, is what we should strive for each and every day.",
        author: "Unknown",
        focusOfTheDay: "Complete an extra 15-minute fast paced recovery walk inside nature or outdoors.",
        wellnessTip: "Combine complex carbs with lean protein within 90 minutes of finishing workouts."
      }
    ];
    const index = Math.abs((dateSeed ? new Date(dateSeed).getDate() : new Date().getDate()) % fallbackMotivations.length);
    return res.json(fallbackMotivations[index]);
  }

  try {
    const prompt = `Generate a high-quality personal fitness motivation block for today (${dateSeed || new Date().toDateString()}).
Do not write commentary; only return a single JSON object.

The output MUST match the following JSON Schema:
{
  "quote": "A powerful, less-cliché, deeply inspiring quote about physical discipline, athletic spirit, or consistency. Under 20 words.",
  "author": "The standard name of the person who said the quote (or 'Unknown')",
  "focusOfTheDay": "A highly specific physical daily micro-workout challenge or activity goal. Friendly energy. E.g. 'Add a 5-minute deep hip flexor stretch after your long walk.'",
  "wellnessTip": "A vital science-backed mental or nutritional wellness tip for recovery, sleep hygiene, or physical hydration."
}

Ensure the output is clean JSON. Do not wrap the JSON output in markdown backticks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["quote", "author", "focusOfTheDay", "wellnessTip"],
          properties: {
            quote: { type: Type.STRING },
            author: { type: Type.STRING },
            focusOfTheDay: { type: Type.STRING },
            wellnessTip: { type: Type.STRING },
          }
        },
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json(parsedJson);
  } catch (error: any) {
    console.error("Error generating daily motivation:", error);
    res.json({
      quote: "The difference between who you are and who you want to be is what you do.",
      author: "Bill Phillips",
      focusOfTheDay: "Execute 15 bodyweight squats and a deep standard hamstring stretch before lunch.",
      wellnessTip: "Strive for 7-8 hours of non-disrupted sleep tonight to allow muscle fibers to repair properly."
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
