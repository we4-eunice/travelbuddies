// api/gemini.ts

// IMPORTANT: This file is a Vercel Serverless Function.
// It runs on the server, not in the browser.

import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Initialize with the API key stored securely in Vercel's Environment Variables
    if (!process.env.API_KEY) {
      return res.status(500).json({ error: "API_KEY environment variable not set on the server." });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              description: "A list of items to bring on the trip.",
              items: { type: Type.STRING, description: "The name of a single item." }
            }
          },
          required: ["items"]
        },
      },
    });

    // Directly parse the text and send the JSON object back
    const jsonText = geminiResponse.text.trim();
    const parsedData = JSON.parse(jsonText);
    return res.status(200).json(parsedData);

  } catch (error) {
    console.error("Error in Gemini API call:", error);
    return res.status(500).json({ error: 'Failed to generate content from AI.' });
  }
}
