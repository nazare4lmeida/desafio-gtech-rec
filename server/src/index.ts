import express from "express";
import cors from "cors";
import { hasSupabaseConfig, supabase } from "./supabase";
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
const DATA_FILE =
  process.env.DATA_FILE_PATH ||
  path.resolve(__dirname, "..", "data", "db.json");

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

function getSupabaseClient() {
  return supabase;
}

async function getFullstackResults(): Promise<StudentResult[]> {
  const sb = getSupabaseClient();
  if (!sb) return db.results;

  const { data, error } = await sb
    .from("results")
    .select("*")
    .order("ts", { ascending: false });

  if (error) throw error;
  return (data ?? []) as StudentResult[];
}

async function getRecoveryResults(): Promise<RecoveryResult[]> {
  const sb = getSupabaseClient();
  if (!sb) return db.recoveryResults;

  const { data, error } = await sb
    .from("recovery_results")
    .select("*")
    .order("ts", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r) => ({
    ...r,
    projectScore: r.project_score,
    bestScore: r.best_score,
  })) as RecoveryResult[];
}

async function getPresencaResults(): Promise<PresencaResult[]> {
  const sb = getSupabaseClient();
  if (!sb) return db.presencaResults;

  const { data, error } = await sb
    .from("presenca_results")
    .select("*")
    .order("ts", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r) => ({
    ...r,
    previousPct: r.previous_pct,
    challengePct: r.challenge_pct,
    presencaPct: r.presenca_pct,
  })) as PresencaResult[];
}

function buildAdminRowsFromData(
  results: StudentResult[],
  recoveryResults: RecoveryResult[],
  presencaResults: PresencaResult[],
): AdminResultRow[] {
  const fullstack: AdminResultRow[] = results.map((r) => ({
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

  const recovery: AdminResultRow[] = recoveryResults.map((r) => ({
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

  const presenca: AdminResultRow[] = presencaResults.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    score:
      typeof r.score === "number" ? r.score : (r.challengePct ?? r.presencaPct),
    max: typeof r.max === "number" ? r.max : 100,
    passed:
      typeof r.passed === "boolean"
        ? r.passed
        : (r.challengePct ?? r.presencaPct) >= 60,
    ts: r.ts,
    module: "presenca",
    moduleLabel: "Desafio Presença",
  }));

  return [...fullstack, ...recovery, ...presenca].sort((a, b) => b.ts - a.ts);
}

async function deleteRow(module: AdminResultRow["module"], id: number) {
  const sb = getSupabaseClient();
  if (sb) {
    const table =
      module === "fullstack"
        ? "results"
        : module === "recuperacao"
          ? "recovery_results"
          : "presenca_results";

    const { error } = await sb.from(table).delete().eq("id", id);
    if (error) throw error;
    return;
  }

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

app.get("/api/results", async (_req, res) => {
  try {
    const data = await getFullstackResults();
    res.json(data);
  } catch (error: any) {
    console.error("Erro ao buscar results:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/results", async (req, res) => {
  const payload = {
    name: req.body.name,
    email: String(req.body.email || "")
      .trim()
      .toLowerCase(),
    score: Number(req.body.score) || 0,
    max: Number(req.body.max) || 0,
    passed: Boolean(req.body.passed),
    cats: req.body.cats || {},
    ts: Date.now(),
  };

  try {
    const sb = getSupabaseClient();

    if (!sb) {
      const nextId = db.results.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      const saved = { ...payload, id: nextId };
      db.results = [saved, ...db.results];
      saveDB();
      return res.status(201).json(saved);
    }

    const { data, error } = await sb.from("results").insert(payload).select().single();

    if (error) {
      console.error("Erro ao salvar result:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error: any) {
    console.error("Erro ao salvar result:", error);
    return res.status(500).json({ error: error.message });
  }
});
app.delete("/api/results", async (_req, res) => {
  try {
    const sb = getSupabaseClient();
    if (sb) {
      const { error } = await sb.from("results").delete().gte("id", 0);
      if (error) throw error;
    } else {
      db.results = [];
      saveDB();
    }
    res.json({ ok: true });
  } catch (error: any) {
    console.error("Erro ao limpar results:", error);
    return res.status(500).json({ error: error.message });
  }
});
app.delete("/api/results/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    await deleteRow("fullstack", id);
    res.json({ ok: true });
  } catch (error: any) {
    console.error("Erro ao remover result:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/recovery-results", async (_req, res) => {
  try {
    const data = await getRecoveryResults();
    res.json(data);
  } catch (error: any) {
    console.error("Erro ao buscar recovery_results:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/recovery-results", async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const score = Number(req.body.score) || 0;
  const projectScore = Number(req.body.projectScore) || 0;
  const bestScore = Math.max(score, projectScore);

  const payload = {
    name: req.body.name,
    email,
    course: req.body.course || null,
    score,
    project_score: projectScore || null,
    best_score: bestScore,
    passed: bestScore >= 6,
    ts: Date.now(),
  };

  try {
    const sb = getSupabaseClient();

    if (!sb) {
      const nextId = db.recoveryResults.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      const saved = {
        id: nextId,
        name: payload.name,
        email: payload.email,
        course: payload.course ?? undefined,
        score: payload.score,
        passed: payload.passed,
        ts: payload.ts,
        projectScore: payload.project_score ?? undefined,
        bestScore: payload.best_score,
      };
      db.recoveryResults = [saved, ...db.recoveryResults];
      saveDB();
      return res.status(201).json(saved);
    }

    const { data, error } = await sb
      .from("recovery_results")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Erro ao salvar recovery_result:", error);

      if (error.code === "23505") {
        return res.status(409).json({ error: "Já submetido" });
      }

      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      ...data,
      projectScore: data.project_score,
      bestScore: data.best_score,
    });
  } catch (error: any) {
    console.error("Erro ao salvar recovery_result:", error);
    return res.status(500).json({ error: error.message });
  }
});
app.delete("/api/recovery-results/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    await deleteRow("recuperacao", id);
    res.json({ ok: true });
  } catch (error: any) {
    console.error("Erro ao remover recovery_result:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/presenca-results", async (_req, res) => {
  try {
    const data = await getPresencaResults();
    res.json(data);
  } catch (error: any) {
    console.error("Erro ao buscar presenca_results:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/presenca-results", async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const score = Number(req.body.score) || 0;
  const max = Number(req.body.max) || 0;
  const challengePct = Number(req.body.challengePct) || 0;
  const presencaPct = Number(req.body.presencaPct) || challengePct;

  const payload = {
    name: req.body.name,
    email,
    course: req.body.course || null,
    score,
    max,
    passed: Boolean(req.body.passed),
    previous_pct:
      req.body.previousPct !== undefined
        ? Number(req.body.previousPct) || 0
        : null,
    challenge_pct: challengePct,
    presenca_pct: presencaPct,
    ts: Date.now(),
  };

  try {
    const sb = getSupabaseClient();

    if (!sb) {
      const nextId = db.presencaResults.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
      const saved = {
        id: nextId,
        name: payload.name,
        email: payload.email,
        course: payload.course ?? undefined,
        score: payload.score,
        max: payload.max,
        passed: payload.passed,
        previousPct: payload.previous_pct ?? undefined,
        challengePct: payload.challenge_pct,
        presencaPct: payload.presenca_pct,
        ts: payload.ts,
      };
      db.presencaResults = [saved, ...db.presencaResults];
      saveDB();
      return res.status(201).json(saved);
    }

    const { data, error } = await sb
      .from("presenca_results")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Erro ao salvar presenca_result:", error);

      if (error.code === "23505") {
        return res.status(409).json({ error: "Já submetido" });
      }

      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      ...data,
      previousPct: data.previous_pct,
      challengePct: data.challenge_pct,
      presencaPct: data.presenca_pct,
    });
  } catch (error: any) {
    console.error("Erro ao salvar presenca_result:", error);
    return res.status(500).json({ error: error.message });
  }
});
app.delete("/api/presenca-results/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    await deleteRow("presenca", id);
    res.json({ ok: true });
  } catch (error: any) {
    console.error("Erro ao remover presenca_result:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin-results", async (_req, res) => {
  try {
    const [results, recoveryResults, presencaResults] = await Promise.all([
      getFullstackResults(),
      getRecoveryResults(),
      getPresencaResults(),
    ]);

    res.json(buildAdminRowsFromData(results, recoveryResults, presencaResults));
  } catch (error: any) {
    console.error("Erro ao buscar admin_results:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin-results", async (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];

  try {
    await Promise.all(
      rows.map((row: { id?: number; module?: AdminResultRow["module"] }) => {
        if (typeof row?.id === "number" && row?.module) {
          return deleteRow(row.module, row.id);
        }
        return Promise.resolve();
      }),
    );

    if (!getSupabaseClient()) saveDB();
    res.json({ ok: true, deleted: rows.length });
  } catch (error: any) {
    console.error("Erro ao remover admin_results:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/stats", async (_req, res) => {
  try {
    const [results, recoveryResults, presencaResults] = await Promise.all([
      getFullstackResults(),
      getRecoveryResults(),
      getPresencaResults(),
    ]);
    const allResults = buildAdminRowsFromData(
      results,
      recoveryResults,
      presencaResults,
    );
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
    results.forEach((r) =>
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
        fullstack: results.length,
        recovery: recoveryResults.length,
        presenca: presencaResults.length,
      },
      recovery: {
        total: recoveryResults.length,
        passed: recoveryResults.filter((r) => r.passed).length,
      },
      presenca: {
        total: presencaResults.length,
        avgPct: presencaResults.length
          ? Math.round(
              presencaResults.reduce((s, r) => s + r.presencaPct, 0) /
                presencaResults.length,
            )
          : 0,
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar stats:", error);
    return res.status(500).json({ error: error.message });
  }
});
app.post("/api/admin-auth", (req, res) => {
  const { email, adminCode } = req.body ?? {};

  const normalizedEmail = String(email ?? "")
    .toLowerCase()
    .trim();
  const normalizedCode = String(adminCode ?? "").trim();

  const isValid =
    normalizedEmail ===
      String(process.env.ADMIN_EMAIL ?? "")
        .toLowerCase()
        .trim() &&
    normalizedCode === String(process.env.ADMIN_ACCESS_CODE ?? "").trim();

  res.json({ ok: isValid });
});

if (!hasSupabaseConfig) {
  console.warn(
    "[server] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes. Usando persistência local em",
    DATA_FILE,
  );
}

app.listen(PORT, () =>
  console.log(`✅  Desafio GtechRecupera API → http://localhost:${PORT}`),
);
export default app;
