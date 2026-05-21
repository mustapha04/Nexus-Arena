import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy for FreeToGame API (to avoid CORS issues)
  app.get("/api/games/list", async (req, res) => {
    try {
      const response = await axios.get("https://www.freetogame.com/api/games", {
        params: req.query
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  app.get("/api/games/details", async (req, res) => {
    try {
      const response = await axios.get("https://www.freetogame.com/api/game", {
        params: req.query
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch game details" });
    }
  });

  // Proxy for CheapShark API
  app.get("/api/deals", async (req, res) => {
    try {
      const response = await axios.get("https://www.cheapshark.com/api/1.0/deals", {
        params: req.query
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deals" });
    }
  });

  // Gemini AI Route
  app.post("/api/ai/summarize", async (req, res) => {
    const { gameTitle, description } = req.body;
    if (!gameTitle || !description) {
      return res.status(400).json({ error: "Game title and description are required" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a concise, high-energy summary of the game "${gameTitle}" for a professional gaming platform. Key points to highlight: target audience, vibe, and why someone should play it. Original description: ${description}`,
        config: {
          systemInstruction: "You are a professional gaming journalist for a premium platform like IGN or Steam. Your tone is energetic, insightful, and persuasive.",
        },
      });
      res.json({ summary: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "AI processing failed" });
    }
  });

  app.post("/api/ai/recommend", async (req, res) => {
    const { favoriteGames, allGames } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on these favorite games: [${favoriteGames.join(", ")}], pick 3 games from this list that the user might enjoy and explain why: [${allGames.join(", ")}]. Return the response in a professional, gamer-friendly tone.`,
        config: {
          systemInstruction: "You are an AI game discovery assistant. You help users find their next favorite game.",
        },
      });
      res.json({ recommendation: response.text });
    } catch (error) {
       res.status(500).json({ error: "AI recommendation failed" });
    }
  });

  // Vite middleware for development
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
