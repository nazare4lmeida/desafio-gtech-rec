import React, { useEffect, useState } from "react";
import { useApp } from "../../hooks/useAppStore";
import {
  WINDOW_OPEN,
  getStudentProfile,
  getWindowStatus,
  saveStudentProfile,
} from "../../data/recoveryQuestions";
import { useAntiCheat } from "../../utils/moduleSecurity";
import { postPresencaResult } from "../../utils/api";

function Countdown({ targetMs }: { targetMs: number }) {
  const [diff, setDiff] = useState(targetMs - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(targetMs - Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return (
    <div className="flex gap-3 justify-center mt-4">
      {d > 0 && <U v={d} label="dias" />}
      <U v={h} label="h" />
      <U v={m} label="min" />
      <U v={sec} label="seg" />
    </div>
  );
}
function U({ v, label }: { v: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-[#E0EDF8] rounded-xl px-4 py-2 min-w-[56px]">
      <span className="font-mono text-2xl font-bold text-navy">
        {String(v).padStart(2, "0")}
      </span>
      <span className="text-[.65rem] text-muted uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function WindowMessage({
  icon,
  title,
  desc,
  color,
  countdown,
  onBack,
}: {
  icon: string;
  title: string;
  desc: string;
  color: string;
  countdown?: React.ReactNode;
  onBack: () => void;
}) {
  return (
    <div className="w-full max-w-[480px] animate-scale-in">
      <div className="bg-surface rounded-card border border-border shadow-card p-10 text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <h2 className={`font-display text-xl font-extrabold ${color} mb-2`}>
          {title}
        </h2>
        <p className="text-muted text-sm leading-relaxed">{desc}</p>
        {countdown}
        <button
          onClick={onBack}
          className="mt-7 px-6 py-2.5 bg-navy text-white font-semibold rounded-xl text-sm hover:bg-blue transition-all"
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
}

interface CodeLine {
  id: number;
  content: string;
  editable: boolean;
  placeholder?: string;
}
interface TestCase {
  input: number[];
  expected: number[];
  label: string;
}

const CHALLENGE_LINES: CodeLine[] = [
  { id: 1, content: "// Desafio: Filtrar Números Pares", editable: false },
  { id: 2, content: "// Complete a linha marcada abaixo", editable: false },
  { id: 3, content: "", editable: false },
  { id: 4, content: "function filtrarPares(numeros) {", editable: false },
  {
    id: 5,
    content: "",
    editable: true,
    placeholder: "  return numeros.filter(n => n % 2 === 0)",
  },
  { id: 6, content: "}", editable: false },
  { id: 7, content: "", editable: false },
  {
    id: 8,
    content: "console.log(filtrarPares([1, 2, 3, 4, 5, 6]))",
    editable: false,
  },
  {
    id: 9,
    content: "console.log(filtrarPares([10, 15, 20, 25]))",
    editable: false,
  },
  { id: 10, content: "console.log(filtrarPares([1, 3, 5]))", editable: false },
];

const TEST_CASES: TestCase[] = [
  {
    input: [1, 2, 3, 4, 5, 6],
    expected: [2, 4, 6],
    label: "filtrarPares([1,2,3,4,5,6]) → [2,4,6]",
  },
  {
    input: [10, 15, 20, 25],
    expected: [10, 20],
    label: "filtrarPares([10,15,20,25]) → [10,20]",
  },
  { input: [1, 3, 5], expected: [], label: "filtrarPares([1,3,5]) → []" },
];

function evalCode(code: string, input: number[]): number[] | null {
  try {
    const fn = new Function(
      "numeros",
      code.trimStart().startsWith("return") ? code : `return ${code}`,
    );
    const result = fn(input);
    return Array.isArray(result) ? result : null;
  } catch {
    return null;
  }
}

function arrEq(a: number[] | null, b: number[]) {
  return (
    !!a &&
    a.length === b.length &&
    a.every((value, index) => value === b[index])
  );
}

function EligRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border ${ok ? "border-green bg-green-bg" : "border-red bg-red-bg"}`}
    >
      <span className="text-sm font-medium text-navy">{label}</span>
      <span className={`font-bold text-sm ${ok ? "text-green" : "text-red"}`}>
        {value} {ok ? "✅" : "❌"}
      </span>
    </div>
  );
}

function PresCard({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex-1 rounded-xl border p-4 text-center ${highlight ? "border-green bg-green-bg" : "border-border bg-[#EFF4FA]"}`}
    >
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`font-mono text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function DesafioPresenca() {
  const { state, navigate } = useApp();
  const windowStatus = getWindowStatus();
  const submissionKey = `presenca_submitted_${state.user?.email}_${WINDOW_OPEN}`;
  const progressKey = `presenca_progress_${state.user?.email}_${WINDOW_OPEN}`;

  const loadPresencaProgress = () => {
    try {
      return JSON.parse(localStorage.getItem(progressKey) || "null");
    } catch {
      return null;
    }
  };

  const saved = loadPresencaProgress();
  const profile = getStudentProfile(state.user?.email);

  const [started, setStarted] = useState(saved?.started ?? false);
  const [userAnswer, setUserAnswer] = useState(saved?.userAnswer ?? "");
  const [submitted, setSubmitted] = useState(saved?.submitted ?? false);
  const [results, setResults] = useState<{ pass: boolean; label: string }[]>(
    saved?.results ?? [],
  );
  const [newPct, setNewPct] = useState(saved?.newPct ?? 0);
  const [prevPct, setPrevPct] = useState(saved?.prevPct ?? 0);
  const [challengePct, setChallengePct] = useState(saved?.challengePct ?? 0);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  useAntiCheat(
    started && !submitted,
    "⚠️ Copiar, colar, selecionar texto, imprimir ou sair da aba não é permitido durante o desafio!",
  );

  useEffect(() => {
    if (localStorage.getItem(submissionKey)) setAlreadyDone(true);
  }, [submissionKey]);

  useEffect(() => {
    if (!state.user) return;
    localStorage.setItem(
      progressKey,
      JSON.stringify({
        started,
        userAnswer,
        submitted,
        results,
        newPct,
        prevPct,
        challengePct,
      }),
    );
  }, [
    state.user,
    progressKey,
    started,
    userAnswer,
    submitted,
    results,
    newPct,
    prevPct,
    challengePct,
  ]);

  const meetsPresenca = profile.presencaPct >= 30;
  const meetsCourse = profile.coursePct >= 50;
  const eligible = meetsPresenca && meetsCourse;

  const handleSubmit = async () => {
    const testResults = TEST_CASES.map((tc) => ({
      pass: arrEq(evalCode(userAnswer, tc.input), tc.expected),
      label: tc.label,
    }));

    const passedTests = testResults.filter((result) => result.pass).length;
    const computedChallengePct = Math.round(
      (passedTests / TEST_CASES.length) * 100,
    );
    const updatedPct = Math.max(profile.presencaPct, computedChallengePct);

    setResults(testResults);
    setPrevPct(profile.presencaPct);
    setChallengePct(computedChallengePct);
    setNewPct(updatedPct);
    setSubmitted(true);
    localStorage.setItem(
      submissionKey,
      JSON.stringify({
        name: state.user!.name,
        email: state.user!.email,
        course: state.user!.course,
        newPct: updatedPct,
        challengePct: computedChallengePct,
        sendEmail,
        ts: Date.now(),
      }),
    );
    localStorage.setItem(
      progressKey,
      JSON.stringify({
        started: true,
        userAnswer,
        submitted: true,
        results: testResults,
        newPct: updatedPct,
        prevPct: profile.presencaPct,
        challengePct: computedChallengePct,
      }),
    );

    saveStudentProfile(state.user!.email, { presencaPct: updatedPct });

    try {
      await postPresencaResult({
        name: state.user!.name,
        email: state.user!.email,
        presencaPct: updatedPct,
        previousPct: profile.presencaPct,
        challengePct: computedChallengePct,
      });
    } catch {
      // fallback local mantido
    }

    window.dispatchEvent(new Event("ddg:update"));
  };

  if (windowStatus === "after") {
    return (
      <WindowMessage
        icon="🔒"
        title="Desafio encerrado"
        desc="O período do Desafio Presença foi encerrado."
        color="text-red"
        onBack={() => navigate("select")}
      />
    );
  }

  if (windowStatus === "before") {
    return (
      <WindowMessage
        icon="⏳"
        title="Desafio não disponível ainda"
        desc="O Desafio Presença abrirá no sábado, dia 28, às 08h."
        color="text-gold"
        countdown={<Countdown targetMs={WINDOW_OPEN} />}
        onBack={() => navigate("select")}
      />
    );
  }

  if (alreadyDone && !submitted) {
    const stored = JSON.parse(localStorage.getItem(submissionKey) || "{}");
    return (
      <WindowMessage
        icon="✅"
        title="Desafio já realizado"
        desc={`Sua presença considerada nesta janela ficou em ${stored.newPct ?? "?"}%. Acerto bruto do desafio: ${stored.challengePct ?? "?"}%.`}
        color="text-green"
        onBack={() => navigate("select")}
      />
    );
  }

  if (!eligible) {
    return (
      <div className="w-full max-w-[480px] animate-scale-in">
        <div className="bg-surface rounded-card border border-border shadow-card p-10 text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="font-display text-xl font-extrabold text-red mb-2">
            Acesso Bloqueado
          </h2>
          <p className="text-muted text-sm mb-5">
            Você não atende aos requisitos mínimos para o Desafio Presença.
          </p>
          <div className="flex flex-col gap-3 text-left mb-6">
            <EligRow
              label="Presença atual ≥ 30%"
              value={`${profile.presencaPct}%`}
              ok={meetsPresenca}
            />
            <EligRow
              label="Progresso do curso ≥ 50%"
              value={`${profile.coursePct}%`}
              ok={meetsCourse}
            />
          </div>
          <p className="text-xs text-muted mb-6">
            Complete mais aulas e aumente sua presença para desbloquear este
            desafio.
          </p>
          <label className="flex items-start gap-3 mt-6 p-4 rounded-2xl border border-border bg-white">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-muted leading-6">
              Quero receber meu resultado por email.
            </span>
          </label>
          <button
            onClick={() => {
              localStorage.removeItem(progressKey);
              navigate("select");
            }}
            className="px-6 py-2.5 bg-navy text-white font-semibold rounded-xl text-sm hover:bg-blue transition-all"
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    const improved = newPct > prevPct;
    return (
      <div
        className="w-full max-w-[520px] animate-scale-in"
        style={{ userSelect: "none" }}
      >
        <div className="bg-surface rounded-card border border-border shadow-card-lg p-8">
          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-blue bg-[#E0EDF8] flex flex-col items-center justify-center mx-auto mb-4">
              <span className="font-mono text-2xl font-bold text-blue">
                {results.filter((r) => r.pass).length}/{TEST_CASES.length}
              </span>
              <span className="text-[.6rem] text-blue font-bold uppercase">
                testes
              </span>
            </div>
            <h2 className="font-display text-xl font-extrabold text-navy">
              Resultado do Desafio Presença
            </h2>
            <p className="text-muted text-sm mt-1">
              Seu desempenho foi aplicado considerando sempre a maior presença.
            </p>
          </div>

          <div className="flex gap-3 mb-5">
            <PresCard
              label="Presença anterior"
              value={`${prevPct}%`}
              color="text-navy"
            />
            <PresCard
              label="Acerto no desafio"
              value={`${challengePct}%`}
              color="text-blue"
            />
            <PresCard
              label="Presença final"
              value={`${newPct}%`}
              color="text-green"
              highlight
            />
          </div>

          <div
            className={`rounded-xl p-4 text-sm mb-5 ${improved ? "bg-green-bg text-green" : "bg-[#EFF4FA] text-muted"}`}
          >
            {improved
              ? `Sua presença subiu de ${prevPct}% para ${newPct}% com base no desafio.`
              : `Sua presença permanece em ${newPct}% porque a regra aplica sempre a maior porcentagem.`}
          </div>

          <div className="bg-[#EFF4FA] rounded-xl p-4 mb-5">
            <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">
              Casos de teste
            </p>
            <div className="flex flex-col gap-2">
              {results.map((result) => (
                <div
                  key={result.label}
                  className={`rounded-lg px-3 py-2 text-sm border ${result.pass ? "bg-green-bg border-green/20 text-green" : "bg-red-bg border-red/20 text-red"}`}
                >
                  {result.pass ? "✅" : "❌"} {result.label}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem(progressKey);
              navigate("select");
            }}
            className="w-full px-6 py-2.5 bg-navy text-white font-semibold rounded-xl text-sm hover:bg-blue transition-all"
          >
            ↩ Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="w-full max-w-[520px] animate-fade-up">
        <div className="bg-surface rounded-card border border-border shadow-card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E0EDF8] flex items-center justify-center text-3xl mx-auto mb-4">
            💻
          </div>
          <h2 className="font-display text-2xl font-extrabold text-navy">
            Desafio Presença
          </h2>
          <p className="text-muted text-sm mt-2 mb-5 leading-relaxed">
            Complete a função JavaScript que filtra números pares.
            <br />O percentual de acertos vira sua nova presença, mas sempre
            prevalece a maior.
          </p>
          <div className="grid grid-cols-2 gap-3 text-left mb-5">
            {[
              ["📊", "Sua presença", `${profile.presencaPct}%`],
              ["🎯", "Progresso", `${profile.coursePct}%`],
              ["⚡", "Acertos = presença", "Prevalece a maior"],
              ["🔒", "Uma tentativa", "Por período"],
            ].map(([icon, title, sub]) => (
              <div
                key={title}
                className="flex gap-3 bg-[#EFF4FA] rounded-xl p-3"
              >
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-xs font-bold text-navy">{title}</p>
                  <p className="text-[.7rem] text-muted">{sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#FDEAEA] border border-red/20 rounded-xl p-3 text-xs text-red mb-5">
            ⚠️ Não copie, cole, selecione texto, tente imprimir ou saia da aba
            durante o desafio.
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("select")}
              className="px-5 py-2.5 border border-navy text-navy font-semibold rounded-xl text-sm hover:bg-navy hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => setStarted(true)}
              className="px-6 py-2.5 bg-blue text-white font-semibold rounded-xl text-sm hover:bg-navy active:scale-[.97] transition-all"
            >
              Começar →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-[680px] animate-fade-up"
      onCopy={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      style={{ userSelect: "none" }}
    >
      <div className="bg-surface rounded-card border border-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#E0EDF8] flex items-center justify-center text-xl">
            💻
          </div>
          <div>
            <h2 className="font-display text-lg font-extrabold text-navy">
              Filtrar Números Pares
            </h2>
            <p className="text-xs text-muted">
              Complete a função abaixo com o corpo correto
            </p>
          </div>
        </div>

        <div className="bg-[#1E3A5F] rounded-xl overflow-hidden mb-4 font-mono text-[.82rem]">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#162d4a] border-b border-white/10">
            <div className="w-3 h-3 rounded-full bg-red/60" />
            <div className="w-3 h-3 rounded-full bg-gold/60" />
            <div className="w-3 h-3 rounded-full bg-green/60" />
            <span className="ml-2 text-sky/60 text-xs">filtrarPares.js</span>
          </div>
          <div className="p-4 space-y-1">
            {CHALLENGE_LINES.map((line) => (
              <div key={line.id} className="flex items-center gap-3">
                <span className="w-5 text-right text-sky/30 select-none shrink-0 text-xs">
                  {line.id}
                </span>
                {line.editable ? (
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={line.placeholder}
                    className="flex-1 bg-[#2d4f70] border border-blue/40 rounded px-2 py-1 text-white placeholder-sky/40 text-[.82rem] font-mono outline-none focus:border-sky"
                    style={{ userSelect: "text" }}
                  />
                ) : (
                  <span
                    className={`${line.content.startsWith("//") ? "text-sky/50" : "text-sky"}`}
                  >
                    {line.content || "\u00A0"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#EFF4FA] rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">
            Casos de Teste
          </p>
          <div className="flex flex-col gap-1">
            {TEST_CASES.map((testCase) => (
              <div
                key={testCase.label}
                className="text-xs font-mono text-slate bg-white rounded-lg px-3 py-1.5 border border-border"
              >
                {testCase.label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => navigate("select")}
            className="px-5 py-2.5 border border-navy text-navy font-semibold rounded-xl text-sm hover:bg-navy hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={!userAnswer.trim()}
            className="px-6 py-2.5 bg-blue text-white font-semibold rounded-xl text-sm hover:bg-navy active:scale-[.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submeter ✓
          </button>
        </div>
      </div>
    </div>
  );
}
