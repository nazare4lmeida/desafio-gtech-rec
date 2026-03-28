import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import {
  AdminResultRow,
  PersistedDB,
  PresencaResult,
  Question,
  RecoveryResult,
  StudentResult,
} from "./types";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.resolve(process.cwd(), "data", "db.json");

const allowedOrigins = [
  "http://localhost:5173",
  "https://desafio-gtech-rec.vercel.app",
  "https://www.desafio-gtech-rec.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }),
);
app.use(express.json());

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 1,
    order: 1,
    difficulty: "beginner",
    category: "frontend",
    text: "Qual tag HTML é usada para criar um link clicável?",
    options: ["<link>", "<a>", "<href>", "<button>"],
    correct: 1,
    feedbackOk:
      "<strong>Correto!</strong> <code>&lt;a&gt;</code> é a tag de âncora do HTML.",
    feedbackNok:
      "<strong>Quase!</strong> A tag correta é <code>&lt;a&gt;</code> (âncora).",
  },
  {
    id: 2,
    order: 2,
    difficulty: "beginner",
    category: "geral",
    text: "O que significa a sigla CSS?",
    options: [
      "Creative Style Sheets",
      "Computer Style System",
      "Cascading Style Sheets",
      "Coded Style Sheets",
    ],
    correct: 2,
    feedbackOk: "<strong>Correto!</strong> CSS = Cascading Style Sheets.",
    feedbackNok: "<strong>Quase!</strong> CSS = Cascading Style Sheets.",
  },
  {
    id: 3,
    order: 3,
    difficulty: "intermediate",
    category: "lógica",
    text: "Qual é o resultado de <code>typeof null</code> em JavaScript?",
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correct: 2,
    feedbackOk:
      '<strong>Correto!</strong> Retorna <code>"object"</code> por retrocompatibilidade.',
    feedbackNok:
      '<strong>Quase!</strong> <code>typeof null</code> retorna <code>"object"</code>.',
  },
  {
    id: 4,
    order: 4,
    difficulty: "intermediate",
    category: "backend",
    text: "Em uma API REST, qual método HTTP atualiza parcialmente um recurso?",
    options: ["PUT", "POST", "DELETE", "PATCH"],
    correct: 3,
    feedbackOk:
      "<strong>Correto!</strong> <code>PATCH</code> atualiza parcialmente.",
    feedbackNok:
      "<strong>Quase!</strong> O método correto é <code>PATCH</code>.",
  },
  {
    id: 5,
    order: 5,
    difficulty: "hard",
    category: "frontend",
    text: "O que é o Virtual DOM no React?",
    options: [
      "Um banco de dados virtual que armazena componentes",
      "Uma cópia leve do DOM real usada para calcular mudanças mínimas",
      "Um sistema de cache para requisições HTTP",
      "Uma versão do DOM que funciona sem JavaScript",
    ],
    correct: 1,
    feedbackOk:
      "<strong>Correto!</strong> O Virtual DOM melhora a performance do React.",
    feedbackNok:
      "<strong>Quase!</strong> O Virtual DOM é uma representação em memória.",
  },
];

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const initial: PersistedDB = {
      results: [],
      recoveryResults: [],
      presencaResults: [],
      questions: DEFAULT_QUESTIONS,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
  }
}

function loadDB(): PersistedDB {
  ensureDataFile();
  try {
    const parsed = JSON.parse(
      fs.readFileSync(DATA_FILE, "utf-8"),
    ) as Partial<PersistedDB>;
    return {
      results: parsed.results ?? [],
      recoveryResults: parsed.recoveryResults ?? [],
      presencaResults: parsed.presencaResults ?? [],
      questions: parsed.questions?.length
        ? parsed.questions
        : DEFAULT_QUESTIONS,
    };
  } catch {
    return {
      results: [],
      recoveryResults: [],
      presencaResults: [],
      questions: DEFAULT_QUESTIONS,
    };
  }
}

let db = loadDB();

function saveDB() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function buildAdminRows(): AdminResultRow[] {
  const fullstack: AdminResultRow[] = db.results.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    score: r.score,
    max: r.max,
    passed: r.passed,
    ts: r.ts,
    module: "fullstack",
    moduleLabel: "Teste Full-Stack",
  }));

  const recovery: AdminResultRow[] = db.recoveryResults.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    score: r.bestScore ?? r.score,
    max: 10,
    passed: r.passed,
    ts: r.ts,
    module: "recuperacao",
    moduleLabel: "Prova de Recuperação",
  }));

  const presenca: AdminResultRow[] = db.presencaResults.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    score: r.presencaPct,
    max: 100,
    passed: true,
    ts: r.ts,
    module: "presenca",
    moduleLabel: "Desafio Presença",
  }));

  return [...fullstack, ...recovery, ...presenca].sort((a, b) => b.ts - a.ts);
}

function deleteRow(module: AdminResultRow["module"], id: number) {
  if (module === "fullstack")
    db.results = db.results.filter((r) => r.id !== id);
  if (module === "recuperacao")
    db.recoveryResults = db.recoveryResults.filter((r) => r.id !== id);
  if (module === "presenca")
    db.presencaResults = db.presencaResults.filter((r) => r.id !== id);
}

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", ts: Date.now() }),
);

app.get("/api/questions", (_req, res) => res.json(db.questions));
app.put("/api/questions/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = db.questions.findIndex((q) => q.id === id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  db.questions[idx] = { ...db.questions[idx], ...req.body, id };
  saveDB();
  return res.json(db.questions[idx]);
});

app.get("/api/results", (_req, res) => res.json(db.results));
app.post("/api/results", (req, res) => {
  const r: StudentResult = { ...req.body, id: Date.now(), ts: Date.now() };
  db.results.push(r);
  saveDB();
  res.status(201).json(r);
});
app.delete("/api/results", (_req, res) => {
  db.results = [];
  saveDB();
  res.json({ ok: true });
});
app.delete("/api/results/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.results = db.results.filter((r) => r.id !== id);
  saveDB();
  res.json({ ok: true });
});

app.get("/api/recovery-results", (_req, res) => res.json(db.recoveryResults));
app.post("/api/recovery-results", (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const existing = db.recoveryResults.find(
    (r) => r.email.toLowerCase() === email,
  );
  if (existing)
    return res.status(409).json({ error: "Já submetido", existing });

  const score = Number(req.body.score) || 0;
  const projectScore = Number(req.body.projectScore) || 0;
  const bestScore = Math.max(projectScore, score);
  const r: RecoveryResult = {
    id: Date.now(),
    name: req.body.name,
    email,
    score,
    projectScore,
    bestScore,
    passed: bestScore >= 6,
    ts: Date.now(),
  };
  db.recoveryResults.push(r);
  saveDB();
  res.status(201).json(r);
});
app.delete("/api/recovery-results/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.recoveryResults = db.recoveryResults.filter((r) => r.id !== id);
  saveDB();
  res.json({ ok: true });
});

app.get("/api/presenca-results", (_req, res) => res.json(db.presencaResults));
app.post("/api/presenca-results", (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const existing = db.presencaResults.find(
    (r) => r.email.toLowerCase() === email,
  );
  if (existing)
    return res.status(409).json({ error: "Já submetido", existing });

  const previousPct = Number(req.body.previousPct) || 0;
  const challengePct = Number(req.body.challengePct) || 0;
  const presencaPct = Math.max(
    previousPct,
    Number(req.body.presencaPct) || 0,
    challengePct,
  );
  const r: PresencaResult = {
    id: Date.now(),
    name: req.body.name,
    email,
    previousPct,
    challengePct,
    presencaPct,
    ts: Date.now(),
  };
  db.presencaResults.push(r);
  saveDB();
  res.status(201).json(r);
});
app.delete("/api/presenca-results/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.presencaResults = db.presencaResults.filter((r) => r.id !== id);
  saveDB();
  res.json({ ok: true });
});

app.get("/api/admin-results", (_req, res) => {
  res.json(buildAdminRows());
});

app.delete("/api/admin-results", (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  rows.forEach((row: { id?: number; module?: AdminResultRow["module"] }) => {
    if (typeof row?.id === "number" && row?.module)
      deleteRow(row.module, row.id);
  });
  saveDB();
  res.json({ ok: true, deleted: rows.length });
});

app.get("/api/stats", (_req, res) => {
  const allResults = buildAdminRows();
  const total = allResults.length;
  const passed = allResults.filter((r) => r.passed).length;
  const avg = total
    ? Math.round(
        allResults.reduce(
          (sum, r) => sum + Math.round((r.score / r.max) * 100),
          0,
        ) / total,
      )
    : 0;

  const cats: Record<string, { correct: number; total: number }> = {};
  db.results.forEach((r) =>
    Object.entries(r.cats).forEach(([c, v]) => {
      if (!cats[c]) cats[c] = { correct: 0, total: 0 };
      cats[c].correct += v.c;
      cats[c].total += v.t;
    }),
  );

  res.json({
    total,
    passed,
    failed: total - passed,
    avgPct: avg,
    categories: cats,
    modules: {
      fullstack: db.results.length,
      recovery: db.recoveryResults.length,
      presenca: db.presencaResults.length,
    },
    recovery: {
      total: db.recoveryResults.length,
      passed: db.recoveryResults.filter((r) => r.passed).length,
    },
    presenca: {
      total: db.presencaResults.length,
      avgPct: db.presencaResults.length
        ? Math.round(
            db.presencaResults.reduce((s, r) => s + r.presencaPct, 0) /
              db.presencaResults.length,
          )
        : 0,
    },
  });
});

app.listen(PORT, () =>
  console.log(`✅  Desafio GtechRecupera API → http://localhost:${PORT}`),
);
export default app;
