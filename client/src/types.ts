export type Screen =
  | "login"
  | "select"
  | "challenge"
  | "result"
  | "admin"
  | "recuperacao"
  | "presenca"
  | "roteiro";

export type CourseTrack = "fullstack" | "ia-generativa" | "ia-soft-skills";

export type Layout = 1 | 2 | 3;
export type Difficulty = "beginner" | "beginner+" | "intermediate" | "hard";
export type Category = "frontend" | "backend" | "lógica" | "geral";
export type AdminTab =
  | "dashboard"
  | "results"
  | "questions"
  | "code"
  | "recs"
  | "challenges"
  | "config";

export interface User {
  name: string;
  email: string;
  course: CourseTrack;
}

export interface Question {
  id: number;
  order: number;
  difficulty: Difficulty;
  category: Category;
  text: string;
  options: string[];
  correct: number;
  feedbackOk: string;
  feedbackNok: string;
}

export interface RecoveryQuestion {
  id: number;
  category: "HTML" | "CSS" | "React" | "JavaScript" | "Banco de Dados";
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface RecoveryResult {
  id: number;
  name: string;
  email: string;
  course?: string;
  score: number;
  passed: boolean;
  ts: number;
}

export interface PresencaResult {
  id: number;
  name: string;
  email: string;
  presencaPct: number;
  ts: number;
}

export interface TestCase {
  input: number[];
  expected: number;
  label: string;
}

export interface CodeChallenge {
  statement: string;
  tests: TestCase[];
}

export interface Challenge {
  id: number;
  title: string;
  desc: string;
  layout: Layout;
  active: boolean;
}

export interface CategoryScore {
  c: number;
  t: number;
}

export interface StudentResult {
  id: number;
  name: string;
  email: string;
  score: number;
  max: number;
  passed: boolean;
  cats: Record<string, CategoryScore>;
  ts: number;
}

export interface Answer {
  qid: number;
  sel?: number;
  correct: boolean;
  category: Category;
  codeResults?: CodeTestResult[];
}

export interface CodeTestResult {
  pass: boolean;
  label: string;
  got: number | string;
}

export interface AdminResultRow {
  id: number;
  name: string;
  email: string;
  course?: string
  score: number;
  max: number;
  passed: boolean;
  ts: number;
  module: "fullstack" | "recuperacao" | "presenca";
  moduleLabel: string;
}

export interface AdminStats {
  total: number;
  passed: number;
  failed: number;
  avgPct: number;
  categories: Record<string, { correct: number; total: number }>;
  modules: {
    fullstack: number;
    recovery: number;
    presenca: number;
  };
  recovery: {
    total: number;
    passed: number;
  };
  presenca: {
    total: number;
    avgPct: number;
  };
}

export interface AppState {
  screen: Screen;
  user: User | null;
  challengeId: number | null;
  layout: Layout;
  currentQ: number;
  answers: Answer[];
  score: number;
  codeScore: number;
  adminTab: AdminTab;
}

export interface EmailPreference {
  sendEmail: boolean;
}

export interface ModuleSubmissionMeta {
  sendEmail?: boolean;
}
