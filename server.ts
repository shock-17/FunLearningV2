import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import BetterSqlite3 from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-for-learning-adventures';

let db: BetterSqlite3.Database;

async function startServer() {
  try {
    const dbPath = process.env.NODE_ENV === 'production' 
      ? path.join('/tmp', 'database.sqlite') 
      : 'database.sqlite';

    db = new BetterSqlite3(dbPath);
    db.pragma('journal_mode = WAL');

    // Initialize schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS parents (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT
      );

      CREATE TABLE IF NOT EXISTS kids (
        id TEXT PRIMARY KEY,
        parent_id TEXT,
        name TEXT,
        avatar TEXT,
        FOREIGN KEY(parent_id) REFERENCES parents(id)
      );

      CREATE TABLE IF NOT EXISTS scores (
        id TEXT PRIMARY KEY,
        kid_id TEXT,
        subject TEXT,
        difficulty TEXT,
        score INTEGER,
        total INTEGER,
        date TEXT,
        FOREIGN KEY(kid_id) REFERENCES kids(id)
      );

      CREATE TABLE IF NOT EXISTS story_progress (
        kid_id TEXT,
        subject TEXT,
        unlocked_level INTEGER DEFAULT 1,
        last_completed_level INTEGER DEFAULT 0,
        total_stars INTEGER DEFAULT 0,
        updated_at TEXT,
        PRIMARY KEY (kid_id, subject),
        FOREIGN KEY(kid_id) REFERENCES kids(id)
      );
    `);

    const app = express();
    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

    app.use(express.json());
    app.use(cookieParser());


  // Middleware
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string };
      (req as any).user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Auth Routes
  app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    if (password.length < 4) {
      res.status(400).json({ error: "Password must be at least 4 characters" });
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = crypto.randomUUID();
      db.prepare('INSERT INTO parents (id, email, password) VALUES (?, ?, ?)').run(id, email, hashedPassword);
      
      const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ id, email });
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: "Email already registered" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const parent = db.prepare('SELECT * FROM parents WHERE email = ?').get(email) as any;
      
      if (!parent || !(await bcrypt.compare(password, parent.password))) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      
      const token = jwt.sign({ id: parent.id, email: parent.email }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ id: parent.id, email: parent.email });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get("/api/me", authMiddleware, (req, res) => {
    const user = (req as any).user;
    res.json({ id: user.id, email: user.email });
  });

  // Kids Routes
  app.get("/api/kids", authMiddleware, (req, res) => {
    const parentId = (req as any).user.id;
    const kids = db.prepare('SELECT * FROM kids WHERE parent_id = ?').all(parentId);
    res.json(kids);
  });

  app.post("/api/kids", authMiddleware, (req, res) => {
    const parentId = (req as any).user.id;
    const { name, avatar } = req.body;
    
    if (!name || !avatar) {
      res.status(400).json({ error: "Name and avatar are required" });
      return;
    }

    const count = db.prepare('SELECT COUNT(*) as count FROM kids WHERE parent_id = ?').get(parentId) as any;
    if (count.count >= 5) {
      res.status(400).json({ error: "Maximum 5 kids profiles allowed" });
      return;
    }

    const id = crypto.randomUUID();
    db.prepare('INSERT INTO kids (id, parent_id, name, avatar) VALUES (?, ?, ?, ?)').run(id, parentId, name, avatar);
    res.json({ id, name, avatar });
  });

  app.delete("/api/kids/:id", authMiddleware, (req, res) => {
    const parentId = (req as any).user.id;
    const kidId = req.params.id;

    const result = db.prepare('DELETE FROM kids WHERE id = ? AND parent_id = ?').run(kidId, parentId);
    
    if (result.changes > 0) {
      // Also delete related scores
      db.prepare('DELETE FROM scores WHERE kid_id = ?').run(kidId);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Kid not found" });
    }
  });

  // Scores Routes
  app.get("/api/scores", authMiddleware, (req, res) => {
    const parentId = (req as any).user.id;
    
    // Get scores for all kids belonging to this parent, ordered by date desc
    const scores = db.prepare(`
      SELECT scores.* FROM scores 
      JOIN kids ON scores.kid_id = kids.id 
      WHERE kids.parent_id = ? 
      ORDER BY scores.date DESC LIMIT 100
    `).all(parentId);
    res.json(scores);
  });

  app.post("/api/scores", authMiddleware, (req, res) => {
    const parentId = (req as any).user.id;
    const { kidId, subject, difficulty, score, total } = req.body;

    // Verify the kid belongs to this parent
    const kid = db.prepare('SELECT id FROM kids WHERE id = ? AND parent_id = ?').get(kidId, parentId);
    if (!kid) {
      res.status(404).json({ error: "Kid not found" });
      return;
    }

    const id = crypto.randomUUID();
    const date = new Date().toISOString();
    
    db.prepare('INSERT INTO scores (id, kid_id, subject, difficulty, score, total, date) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, kidId, subject, difficulty, score, total, date);
    
    res.json({ id, kid_id: kidId, kidId, subject, difficulty, score, total, date });
  });

  // Story Mode Routes
  app.get("/api/story/progress", authMiddleware, (req, res) => {
    const parentId = (req as any).user.id;
    const kidId = req.query.kidId as string | undefined;
    if (!kidId) {
      res.status(400).json({ error: "kidId is required" });
      return;
    }

    const kid = db.prepare('SELECT id FROM kids WHERE id = ? AND parent_id = ?').get(kidId, parentId);
    if (!kid) {
      res.status(404).json({ error: "Kid not found" });
      return;
    }

    const rows = db.prepare('SELECT kid_id, subject, unlocked_level, last_completed_level, total_stars, updated_at FROM story_progress WHERE kid_id = ?').all(kidId);
    res.json(rows);
  });

  app.post("/api/story/complete", authMiddleware, (req, res) => {
    const parentId = (req as any).user.id;
    const { kidId, subject, level, stars } = req.body as { kidId?: string; subject?: string; level?: number; stars?: number };

    if (!kidId || !subject || typeof level !== 'number' || typeof stars !== 'number') {
      res.status(400).json({ error: "kidId, subject, level, stars are required" });
      return;
    }
    if (!['Math', 'English', 'Mandarin'].includes(subject)) {
      res.status(400).json({ error: "Invalid subject" });
      return;
    }
    if (level < 1 || level > 50) {
      res.status(400).json({ error: "Invalid level" });
      return;
    }
    if (stars < 0 || stars > 3) {
      res.status(400).json({ error: "Invalid stars" });
      return;
    }

    const kid = db.prepare('SELECT id FROM kids WHERE id = ? AND parent_id = ?').get(kidId, parentId);
    if (!kid) {
      res.status(404).json({ error: "Kid not found" });
      return;
    }

    const now = new Date().toISOString();
    const existing = db.prepare(
      'SELECT unlocked_level, last_completed_level, total_stars FROM story_progress WHERE kid_id = ? AND subject = ?'
    ).get(kidId, subject) as { unlocked_level?: number; last_completed_level?: number; total_stars?: number } | undefined;

    const prevUnlocked = existing?.unlocked_level ?? 1;
    const prevCompleted = existing?.last_completed_level ?? 0;
    const prevStars = existing?.total_stars ?? 0;

    const newCompleted = Math.max(prevCompleted, level);
    const newUnlocked = Math.max(prevUnlocked, level + 1);
    const newTotalStars = prevStars + stars;

    db.prepare(
      `
      INSERT INTO story_progress (kid_id, subject, unlocked_level, last_completed_level, total_stars, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(kid_id, subject) DO UPDATE SET
        unlocked_level = excluded.unlocked_level,
        last_completed_level = excluded.last_completed_level,
        total_stars = excluded.total_stars,
        updated_at = excluded.updated_at
      `
    ).run(kidId, subject, newUnlocked, newCompleted, newTotalStars, now);

    const row = db.prepare('SELECT kid_id, subject, unlocked_level, last_completed_level, total_stars, updated_at FROM story_progress WHERE kid_id = ? AND subject = ?').get(kidId, subject);
    res.json(row);
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
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
