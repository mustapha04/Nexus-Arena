import express from "express";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, increment } from "firebase/firestore";

dotenv.config();

const app = express();
app.use(express.json());

// Firebase setup for server-side analytics tracking
let db: any = null;
try {
  if (process.env.VITE_FIREBASE_API_KEY) {
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
    };
    const firebaseApp = initializeApp(firebaseConfig);
    const databaseId = process.env.VITE_FIREBASE_DATABASE_ID;
    if (databaseId && databaseId !== '(default)' && databaseId !== '') {
      db = getFirestore(firebaseApp, databaseId);
    } else {
      db = getFirestore(firebaseApp);
    }
    console.log("Firebase initialized for serverless analytics.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase on serverless:", error);
}

// Gemini Setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Dynamic SEO XML Sitemap and robots.txt
app.get("/sitemap.xml", async (req, res) => {
  try {
    const response = await axios.get("https://www.freetogame.com/api/games");
    const games = response.data || [];
    const host = req.headers.host || "nexusarena.com";
    const baseUrl = `https://${host}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const staticPaths = ["", "/search", "/trending", "/top-rated", "/upcoming", "/deals", "/login"];
    staticPaths.forEach(p => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${p}</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>${p === "" ? "1.0" : "0.8"}</priority>\n`;
      xml += `  </url>\n`;
    });

    const getSlug = (title: string): string => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    };

    games.slice(0, 150).forEach((game: any) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/games/${getSlug(game.title)}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Sitemap creation failed", error);
    res.header("Content-Type", "application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://nexusarena.com/</loc></url></urlset>`);
  }
});

app.get("/robots.txt", (req, res) => {
  const host = req.headers.host || "nexusarena.com";
  const baseUrl = `https://${host}`;

  res.header("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /admin-dashboard
Disallow: /admin-login

Sitemap: ${baseUrl}/sitemap.xml`);
});

// Health check
app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok" });
});

// Track clicks on affiliate links
app.post(["/api/analytics/click", "/analytics/click"], async (req, res) => {
  const { gameId, platform, userId } = req.body;
  if (!gameId || !platform) {
    return res.status(400).json({ error: "gameId and platform are required" });
  }

  try {
    if (db) {
      await addDoc(collection(db, "affiliate_clicks"), {
        game_id: String(gameId),
        platform: String(platform),
        user_id: userId || null,
        clicked_at: new Date().toISOString()
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to track click:", error);
    res.status(500).json({ error: "Failed to track click" });
  }
});

// Track game views
app.post(["/api/analytics/view", "/analytics/view"], async (req, res) => {
  const { gameId } = req.body;
  if (!gameId) {
    return res.status(400).json({ error: "gameId is required" });
  }

  try {
    if (db) {
      const statsRef = collection(db, "game_stats");
      const q = query(statsRef, where("game_id", "==", String(gameId)));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const docId = snap.docs[0].id;
        const docRef = doc(db, "game_stats", docId);
        await updateDoc(docRef, {
          views: increment(1)
        });
      } else {
        await addDoc(statsRef, {
          game_id: String(gameId),
          views: 1,
          searches: 0
        });
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to track view:", error);
    res.status(500).json({ error: "Failed to track view" });
  }
});

// Proxy for FreeToGame API (to avoid CORS issues)
app.get(["/api/games/list", "/games/list"], async (req, res) => {
  try {
    const response = await axios.get("https://www.freetogame.com/api/games", {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

app.get(["/api/games/details", "/games/details"], async (req, res) => {
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
app.get(["/api/deals", "/deals"], async (req, res) => {
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
app.post(["/api/ai/summarize", "/ai/summarize"], async (req, res) => {
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

app.post(["/api/ai/recommend", "/ai/recommend"], async (req, res) => {
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

export default app;
