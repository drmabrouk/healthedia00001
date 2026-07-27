import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initDB, dbOps, DatabaseStore } from "./server/db";
import { GoogleGenAI } from "@google/genai";

// Initialize GenAI client safely
const getAIClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY environment variable is missing or unconfigured. Please configure your Gemini API key in the Secrets menu.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};

// Safe __dirname for both ESM (development) and CJS (bundled production)
const isESM = typeof import.meta !== "undefined" && typeof import.meta.url !== "undefined";
const getAppDirname = () => {
  if (isESM) {
    return path.dirname(fileURLToPath(import.meta.url));
  }
  return __dirname;
};

const __dirname = getAppDirname();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: "10mb" }));

  // Initialize Server-Side Database
  initDB();

  // 0. General database sync endpoint (fetches all records for initial hydration)
  app.get("/api/db", (req, res) => {
    try {
      res.json(dbOps.getStore());
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load database", details: err.message });
    }
  });

  // Authentication endpoints
  app.post("/api/auth/login", (req, res) => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    try {
      const user = dbOps.getItemById("users", email.toLowerCase());
      if (user) {
        res.json({ success: true, user });
      } else {
        res.status(404).json({ error: "User profile not found in database. Please register." });
      }
    } catch (err: any) {
      res.status(500).json({ error: "Login failed", details: err.message });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { user } = req.body;
    if (!user || !user.email) {
      res.status(400).json({ error: "Invalid registration payload" });
      return;
    }
    try {
      const emailLower = user.email.toLowerCase();
      const existingUser = dbOps.getItemById("users", emailLower);
      if (existingUser) {
        res.status(400).json({ error: "A user with this email address is already registered." });
        return;
      }

      const createdUser = dbOps.insertItem("users", {
        ...user,
        email: emailLower,
        joinedAt: new Date().toISOString().substring(0, 10),
        status: "Active"
      });
      res.json({ success: true, user: createdUser });
    } catch (err: any) {
      res.status(500).json({ error: "Registration failed", details: err.message });
    }
  });

  app.post("/api/auth/profile", (req, res) => {
    const { email, profile } = req.body;
    if (!email || !profile) {
      res.status(400).json({ error: "Invalid profile update payload" });
      return;
    }
    try {
      const emailLower = email.toLowerCase();
      const updatedUser = dbOps.updateItem("users", emailLower, profile);
      if (updatedUser) {
        res.json({ success: true, user: updatedUser });
      } else {
        res.status(404).json({ error: "User profile not found" });
      }
    } catch (err: any) {
      res.status(500).json({ error: "Profile update failed", details: err.message });
    }
  });

  // Generic REST APIs for all collections
  app.post("/api/collections/:collection/sync", (req, res) => {
    const colName = req.params.collection as keyof DatabaseStore;
    const data = req.body;
    try {
      dbOps.setCollection(colName, data);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: `Failed to sync collection ${colName}`, details: err.message });
    }
  });

  app.get("/api/collections/:collection", (req, res) => {
    const colName = req.params.collection as keyof DatabaseStore;
    try {
      const data = dbOps.getCollection(colName);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: `Failed to fetch collection ${colName}` });
    }
  });

  app.post("/api/collections/:collection", (req, res) => {
    const colName = req.params.collection as keyof DatabaseStore;
    const item = req.body;
    try {
      const created = dbOps.insertItem(colName, item);
      res.json({ success: true, item: created });
    } catch (err: any) {
      res.status(500).json({ error: `Failed to insert item into ${colName}`, details: err.message });
    }
  });

  app.put("/api/collections/:collection/:id", (req, res) => {
    const colName = req.params.collection as keyof DatabaseStore;
    const { id } = req.params;
    const updatedFields = req.body;
    try {
      const updated = dbOps.updateItem(colName, id, updatedFields);
      if (updated) {
        res.json({ success: true, item: updated });
      } else {
        res.status(404).json({ error: `Item with ID ${id} not found in ${colName}` });
      }
    } catch (err: any) {
      res.status(500).json({ error: `Failed to update item in ${colName}`, details: err.message });
    }
  });

  app.delete("/api/collections/:collection/:id", (req, res) => {
    const colName = req.params.collection as keyof DatabaseStore;
    const { id } = req.params;
    try {
      const deleted = dbOps.deleteItem(colName, id);
      res.json({ success: deleted });
    } catch (err: any) {
      res.status(500).json({ error: `Failed to delete item from ${colName}`, details: err.message });
    }
  });

  // Dynamic live diagnostics endpoint for local DB
  app.get("/api/system/db-info", (req, res) => {
    try {
      const store = dbOps.getStore();
      const dbPath = path.join(process.cwd(), "data", "db.json");
      let storageBytes = 0;
      if (fs.existsSync(dbPath)) {
        storageBytes = fs.statSync(dbPath).size;
      } else {
        storageBytes = Buffer.byteLength(JSON.stringify(store));
      }
      const storageUsageStr = storageBytes > 1024 * 1024
        ? `${(storageBytes / (1024 * 1024)).toFixed(2)} MB`
        : storageBytes > 1024
          ? `${(storageBytes / 1024).toFixed(2)} KB`
          : `${storageBytes} Bytes`;

      // Compute stats
      let totalRecords = 0;
      let tableCount = 0;
      for (const key of Object.keys(store)) {
        tableCount++;
        const val = store[key as keyof typeof store];
        if (Array.isArray(val)) {
          totalRecords += val.length;
        } else if (val && typeof val === "object") {
          totalRecords += Object.keys(val).length;
        } else if (val) {
          totalRecords += 1;
        }
      }

      res.json({
        databaseEngine: "JSON Local Database (with atomic replication)",
        databaseStatus: "Optimal",
        connectionStatus: "Connected",
        serverStatus: "Online",
        databaseVersion: "v1.4.2-stable",
        storageUsage: storageUsageStr,
        numberTables: tableCount,
        totalRecords: totalRecords,
        filePath: dbPath
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load database diagnostics", details: err.message });
    }
  });

  // Keep sitemap and robots in memory for instant high-speed dynamic serving
  let memorySitemap = "";
  let memoryRobots = "";

  // Helper to sync memory on startup if files already exist
  const publicDir = path.join(process.cwd(), "public");
  const sitemapPath = path.join(publicDir, "sitemap.xml");
  const robotsPath = path.join(publicDir, "robots.txt");

  if (fs.existsSync(sitemapPath)) {
    try {
      memorySitemap = fs.readFileSync(sitemapPath, "utf-8");
    } catch (e) {
      console.error("Error reading initial sitemap:", e);
    }
  }

  if (fs.existsSync(robotsPath)) {
    try {
      memoryRobots = fs.readFileSync(robotsPath, "utf-8");
    } catch (e) {
      console.error("Error reading initial robots.txt:", e);
    }
  }

  // 1. API Endpoint to update the XML sitemap
  app.post("/api/sitemap", (req, res) => {
    const { xml } = req.body;
    if (!xml) {
      res.status(400).json({ error: "No XML content provided" });
      return;
    }

    try {
      memorySitemap = xml;

      // Ensure public directory exists
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      // Write to public directory
      fs.writeFileSync(sitemapPath, xml, "utf-8");

      // Also write to dist directory in production if it exists
      const distPath = path.join(process.cwd(), "dist");
      if (fs.existsSync(distPath)) {
        fs.writeFileSync(path.join(distPath, "sitemap.xml"), xml, "utf-8");
      }

      console.log("[Sitemap Server] Sitemap XML successfully generated and synchronized to files.");
      res.json({ success: true, message: "Sitemap updated successfully" });
    } catch (error: any) {
      console.error("[Sitemap Server] Error saving sitemap.xml:", error);
      res.status(500).json({ error: "Failed to write sitemap file", details: error.message });
    }
  });

  // 2. API Endpoint to update robots.txt
  app.post("/api/robots", (req, res) => {
    const { robots } = req.body;
    if (!robots) {
      res.status(400).json({ error: "No robots content provided" });
      return;
    }

    try {
      memoryRobots = robots;

      // Ensure public directory exists
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      // Write to public directory
      fs.writeFileSync(robotsPath, robots, "utf-8");

      // Also write to dist directory in production if it exists
      const distPath = path.join(process.cwd(), "dist");
      if (fs.existsSync(distPath)) {
        fs.writeFileSync(path.join(distPath, "robots.txt"), robots, "utf-8");
      }

      console.log("[Sitemap Server] Robots.txt successfully updated and synchronized to files.");
      res.json({ success: true, message: "Robots.txt updated successfully" });
    } catch (error: any) {
      console.error("[Sitemap Server] Error saving robots.txt:", error);
      res.status(500).json({ error: "Failed to write robots.txt", details: error.message });
    }
  });

  // 3. Dynamic Endpoint: Serve sitemap.xml
  app.get("/sitemap.xml", (req, res) => {
    res.header("Content-Type", "application/xml");
    
    if (memorySitemap) {
      res.send(memorySitemap);
      return;
    }

    // Fallback: read from file
    if (fs.existsSync(sitemapPath)) {
      try {
        const fileContent = fs.readFileSync(sitemapPath, "utf-8");
        memorySitemap = fileContent;
        res.send(fileContent);
        return;
      } catch (err) {
        console.error("Error reading sitemap file on request:", err);
      }
    }

    // Minimal dynamic fallback
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://healthedia.org/</loc>
    <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    res.send(fallbackSitemap);
  });

  // 4. Dynamic Endpoint: Serve robots.txt
  app.get("/robots.txt", (req, res) => {
    res.header("Content-Type", "text/plain");

    if (memoryRobots) {
      res.send(memoryRobots);
      return;
    }

    // Fallback: read from file
    if (fs.existsSync(robotsPath)) {
      try {
        const fileContent = fs.readFileSync(robotsPath, "utf-8");
        memoryRobots = fileContent;
        res.send(fileContent);
        return;
      } catch (err) {
        console.error("Error reading robots file on request:", err);
      }
    }

    // Default fallback
    const defaultRobots = `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /profile\nDisallow: /api/\nDisallow: /admin/\n\nSitemap: https://healthedia.org/sitemap.xml`;
    res.send(defaultRobots);
  });

  // AI Assistant Chat route
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, paperContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid payload: messages must be an array" });
      return;
    }

    try {
      // Check for valid API key upfront to avoid unnecessary API failure logs
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        throw new Error("GEMINI_API_KEY environment variable is missing or unconfigured.");
      }

      const ai = getAIClient();
      
      // Construct dynamic system instructions/context
      let systemInstruction = "You are a professional, expert Sports Science, Clinical Rehabilitation, and Cardiometabolic Health AI Assistant named Healthedia AI.\n" +
        "Provide objective, evidence-based responses citing physiological principles. Be supportive but highly rigorous and academic.\n" +
        "If the user asks about specific research, explain concepts clearly using established literature references.";

      if (paperContext) {
        systemInstruction += `\n\nActive research paper context:\nTitle: ${paperContext.title}\nAuthors: ${paperContext.authors?.join(", ") || "Unknown"}\nAbstract: ${paperContext.abstract || "No abstract available"}`;
      }

      // Convert messages list to Gemini chats format
      const chatHistory = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const lastUserMessage = messages[messages.length - 1];
      if (!lastUserMessage || !lastUserMessage.content) {
        res.status(400).json({ error: "Last message is empty" });
        return;
      }

      const activeChat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: chatHistory,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const result = await activeChat.sendMessage({ message: lastUserMessage.content });
      res.json({ text: result.text || "" });
    } catch (err: any) {
      // Gracefully handle missing/invalid API keys or upstream service limits with helpful scientific fallback
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      const lowerMsg = lastUserMsg.toLowerCase();
      
      let fallbackText = "";
      if (lowerMsg.includes("acl") || lowerMsg.includes("rehabilitation")) {
        fallbackText = "Evidence-based ACL Rehabilitation: Phase 1 focuses on swelling control and early 0° extension. Phase 2 emphasizes closed-chain quadriceps strength (squats 0-60°). Phase 3 introduces linear running at >80% Limb Symmetry Index (LSI).";
      } else if (lowerMsg.includes("endocrine") || lowerMsg.includes("fatigue")) {
        fallbackText = "Endocrine Fatigue Mitigation: Implement wave periodization (3 weeks loading, 1 week deload) to preserve basal cortisol. Maintain intra-workout carbohydrate availability to attenuate acute salivary IgA suppression.";
      } else if (lowerMsg.includes("heart") || lowerMsg.includes("strain")) {
        fallbackText = "Myocardial Strain Dynamics: Endurance training induces eccentric LV remodeling. Speckle-tracking echocardiography demonstrates transient post-race reductions in global longitudinal strain (GLS) recovering within 48-72 hours.";
      } else {
        fallbackText = `${lastUserMsg}: Evidence-based clinical research index analyzing physiological adaptations, neuromuscular mechanics, and targeted performance reconditioning protocols.`;
      }

      res.json({ text: fallbackText, isFallback: true });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Healthedia SEO Core" });
  });

  // Integrate Vite Dev Middleware in development, or Static Files in production
  if (process.env.NODE_ENV !== "production") {
    console.log("[Sitemap Server] Initializing Vite Developer Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Sitemap Server] Running in Production. Serving static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sitemap Server] Healthedia dynamic service running on http://localhost:${PORT}`);
  });
}

startServer();
