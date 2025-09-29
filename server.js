import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Database from "@replit/database";

const db = new Database();
const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/dreams", async (req, res) => {
  try {
    const { userId = "guest", title = "Mera Sapna", text = "" } = req.body;
    const id = Date.now().toString();
    const doc = { id, userId, title, text, createdAt: new Date().toISOString() };

    const userKey = `user:${userId}:dreams`;
    const list = (await db.get(userKey)) || [];
    list.unshift(doc);
    await db.set(userKey, list);

    const globalList = (await db.get("global:dreams")) || [];
    globalList.unshift(doc);
    await db.set("global:dreams", globalList.slice(0, 200));

    res.json({ success: true, dream: doc });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

app.get("/api/dreams", async (req, res) => {
  try {
    const userId = req.query.userId || null;
    if (userId) {
      const userKey = `user:${userId}:dreams`;
      const list = (await db.get(userKey)) || [];
      return res.json({ success: true, dreams: list });
    } else {
      const list = (await db.get("global:dreams")) || [];
      return res.json({ success: true, dreams: list });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));