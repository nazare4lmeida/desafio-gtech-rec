import React, { useEffect, useState } from "react";
import { useApp } from "../../hooks/useAppStore";
import {
  WINDOW_OPEN,
  getStudentProfile,
  getWindowStatus,
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
  input: any;
  expected: any;
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

const CHALLENGE_2_LINES: CodeLine[] = [
  {
    id: 5,
    content: "// 2. Retorne 'HELLO WORLD' em maiúsculas",
    editable: false,
  },
  { id: 6, content: "function saudar(texto) {", editable: false },
  {
    id: 7,
    content: "",
    editable: true,
    placeholder: "  return texto.toUpperCase()",
  },
  { id: 8, content: "}", editable: false },
];

const TEST_CASES_2: TestCase[] = [
  {
    input: "hello world",
    expected: "HELLO WORLD",
    label: "saudar('hello world') → 'HELLO WORLD'",
  },
];

function evalCode(code: string, input: any, paramName: string): any {
  try {
    const normalizedCode = code.trim();

    const fn = new Function(
      paramName,
      normalizedCode.startsWith("return")
        ? normalizedCode
        : `return ${normalizedCode}`,
    );

    return fn(input);
  } catch (error) {
    console.error("Erro ao avaliar código:", {
      code,
      input,
      paramName,
      error,
    });
    return "__EVAL_ERROR__";
  }
}

function arrEq(a: any, b: number[]) {
  return (
    Array.isArray(a) &&
    a.length === b.length &&
    a.every((value, index) => value === b[index])
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
      className={`flex-1 rounded-xl border p-4 text-center ${
        highlight ? "border-green bg-green-bg" : "border-border bg-[#EFF4FA]"
      }`}
    >
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`font-mono text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function DesafioPresenca() {
  const { state, navigate, setAdminTab } = useApp();
  const windowStatus = getWindowStatus(state.user?.email);
  const isAdminUser =
    state.user?.email?.toLowerCase() === "nazyalmeida@gmail.com";
  const ATTEMPT_VERSION = "reset-v5";

  const submissionKey = `presenca_submitted_${state.user?.email}_${ATTEMPT_VERSION}`;
  const progressKey = `presenca_progress_${state.user?.email}_${ATTEMPT_VERSION}`;

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
  const [userAnswer2, setUserAnswer2] = useState(saved?.userAnswer2 ?? "");
  const [submitted, setSubmitted] = useState(saved?.submitted ?? false);
  const [results, setResults] = useState<{ pass: boolean; label: string }[]>(
    saved?.results ?? [],
  );
  const [newPct, setNewPct] = useState(saved?.newPct ?? 0);
  const [prevPct, setPrevPct] = useState(saved?.prevPct ?? 0);
  const [challengePct, setChallengePct] = useState(saved?.challengePct ?? 0);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [sendEmail] = useState(true);

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
        userAnswer2,
        submitted,
        results,
        newPct,
        prevPct,
        challengePct,
      }),
    );
  }, [
    started,
    userAnswer,
    userAnswer2,
    submitted,
    results,
    newPct,
    prevPct,
    challengePct,
    progressKey,
    state.user,
  ]);

  const handleSubmit = async () => {
    const results1 = TEST_CASES.map((tc) => ({
      pass: arrEq(evalCode(userAnswer, tc.input, "numeros"), tc.expected),
      label: tc.label,
    }));

    const results2 = TEST_CASES_2.map((tc) => ({
      pass: evalCode(userAnswer2, tc.input, "texto") === tc.expected,
      label: tc.label,
    }));

    const allTestResults = [...results1, ...results2];
    const totalTests = TEST_CASES.length + TEST_CASES_2.length;
    const passedTests = allTestResults.filter((result) => result.pass).length;

    const computedChallengePct = Math.round((passedTests / totalTests) * 100);
    const updatedPct = computedChallengePct;
    const passed = computedChallengePct >= 60;

    setResults(allTestResults);
    setPrevPct(profile.presencaPct);
    setChallengePct(computedChallengePct);
    setNewPct(updatedPct);

    try {
      await postPresencaResult({
        name: state.user!.name,
        email: state.user!.email,
        course: state.user!.course,
        score: passedTests,
        max: totalTests,
        passed,
        presencaPct: computedChallengePct,
        challengePct: computedChallengePct,
      });

      setSubmitted(true);

      localStorage.setItem(
        submissionKey,
        JSON.stringify({
          name: state.user!.name,
          email: state.user!.email,
          course: state.user!.course,
          score: passedTests,
          max: totalTests,
          passed,
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
          userAnswer2,
          submitted: true,
          results: allTestResults,
          score: passedTests,
          max: totalTests,
          passed,
          newPct: updatedPct,
          prevPct: profile.presencaPct,
          challengePct: computedChallengePct,
        }),
      );

      window.dispatchEvent(new Event("ddg:update"));
      window.location.reload();
    } catch (error: any) {
      console.error("Erro ao salvar resultado:", error);
      alert("Não foi possível salvar seu resultado. Tente novamente.");
    }
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
        desc={`Sua presença considerada pelo Desafio ficou em ${
          stored.newPct ?? "?"
        }%. Mas o que vale é a porcentagem mais alta entre a sua presença atual e a do desafio.`}
        color="text-green"
        onBack={() => navigate("select")}
      />
    );
  }

  if (submitted) {
    return (
      <div
        className="w-full max-w-[520px] mx-auto animate-scale-in text-center"
        style={{ userSelect: "none" }}
      >
        <div className="bg-surface rounded-card border border-border shadow-card-lg p-8">
          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-blue bg-[#E0EDF8] flex flex-col items-center justify-center mx-auto mb-4">
              <span className="font-mono text-2xl font-bold text-blue">
                {results.filter((r) => r.pass).length}/
                {TEST_CASES.length + TEST_CASES_2.length}
              </span>
              <span className="text-[.6rem] text-blue font-bold uppercase">
                testes
              </span>
            </div>
            <h2 className="font-display text-xl font-extrabold text-navy">
              Resultado do Desafio Presença
            </h2>
            <p className="text-muted text-sm mt-1">
              Seu resultado final foi calculado com base nos acertos do desafio.
              No entanto, leve em consideração a maior nota que tiver.
            </p>
          </div>

          <div className="flex gap-3 mb-5">
            <PresCard
              label="Testes corretos"
              value={`${results.filter((r) => r.pass).length}/${TEST_CASES.length + TEST_CASES_2.length}`}
              color="text-navy"
            />
            <PresCard
              label="Pontuação final"
              value={`${challengePct}%`}
              color="text-green"
              highlight
            />
          </div>

          <div className="rounded-xl p-4 text-sm mb-5 bg-[#EFF4FA] text-muted">
            Sua pontuação final neste desafio foi de {challengePct}%.
          </div>

          <div className="bg-[#EFF4FA] rounded-xl p-4 mb-5">
            <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">
              Casos de teste
            </p>
            <div className="flex flex-col gap-2">
              {results.map((result) => (
                <div
                  key={result.label}
                  className={`rounded-lg px-3 py-2 text-sm border ${
                    result.pass
                      ? "bg-green-bg border-green/20 text-green"
                      : "bg-red-bg border-red/20 text-red"
                  }`}
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
            <br />
            O percentual de acertos vira sua nova presença, mas sempre prevalece
            a maior.
          </p>
          <div className="grid grid-cols-2 gap-3 text-left mb-5">
            {[
              ["📊", "Cálculo de presença", "Baseado em acertos"],
              ["🎯", "Progresso", "Baseado em acertos"],
              ["⚡", "Acertos = presença", "Prevalece a maior"],
              ["🔒", "Uma tentativa", "Pense bem antes de iniciar"],
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
      className="w-full max-w-[680px] mx-auto animate-fade-up"
      onCopy={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      style={{ userSelect: "none" }}
    >
      <div className="mb-4 flex justify-between items-center">
        {isAdminUser ? (
          <button
            onClick={() => {
              setAdminTab("dashboard");
              navigate("admin");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-sm font-semibold shadow-sm hover:bg-blue transition-all duration-200"
          >
            ← Voltar para Admin
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={() => navigate("select")}
          className="px-4 py-2 border border-navy text-navy font-semibold rounded-xl text-sm hover:bg-navy hover:text-white transition-all"
        >
          ← Voltar
        </button>
      </div>

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

        <div className="space-y-4 mb-4">
          <div className="bg-[#1E3A5F] rounded-xl overflow-hidden font-mono text-[.82rem]">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#162d4a] border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red/60" />
              <div className="w-3 h-3 rounded-full bg-gold/60" />
              <div className="w-3 h-3 rounded-full bg-green/60" />
              <span className="ml-2 text-sky/60 text-xs">filtrarPares.js</span>
            </div>
            <div className="p-4 space-y-1">
              {CHALLENGE_LINES.map((line) => (
                <div
                  key={`challenge-1-${line.id}`}
                  className="flex items-center gap-3"
                >
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
                      className={`${
                        line.content.startsWith("//")
                          ? "text-sky/50"
                          : "text-sky"
                      }`}
                    >
                      {line.content || "\u00A0"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1E3A5F] rounded-xl overflow-hidden font-mono text-[.82rem]">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#162d4a] border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red/60" />
              <div className="w-3 h-3 rounded-full bg-gold/60" />
              <div className="w-3 h-3 rounded-full bg-green/60" />
              <span className="ml-2 text-sky/60 text-xs">saudar.js</span>
            </div>
            <div className="p-4 space-y-1">
              {CHALLENGE_2_LINES.map((line) => (
                <div
                  key={`challenge-2-${line.id}`}
                  className="flex items-center gap-3"
                >
                  <span className="w-5 text-right text-sky/30 select-none shrink-0 text-xs">
                    {line.id}
                  </span>
                  {line.editable ? (
                    <input
                      type="text"
                      value={userAnswer2}
                      onChange={(e) => setUserAnswer2(e.target.value)}
                      placeholder={line.placeholder}
                      className="flex-1 bg-[#2d4f70] border border-blue/40 rounded px-2 py-1 text-white placeholder-sky/40 text-[.82rem] font-mono outline-none focus:border-sky"
                      style={{ userSelect: "text" }}
                    />
                  ) : (
                    <span
                      className={`${
                        line.content.startsWith("//")
                          ? "text-sky/50"
                          : "text-sky"
                      }`}
                    >
                      {line.content || "\u00A0"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#EFF4FA] rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">
            Casos de Teste
          </p>
          <div className="flex flex-col gap-1">
            {[...TEST_CASES, ...TEST_CASES_2].map((testCase) => (
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
            disabled={!userAnswer.trim() || !userAnswer2.trim()}
            className="px-6 py-2.5 bg-blue text-white font-semibold rounded-xl text-sm hover:bg-navy active:scale-[.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submeter ✓
          </button>
        </div>
      </div>
    </div>
  );
}