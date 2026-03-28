import React, { useEffect, useState } from "react";
import { useApp } from "../../hooks/useAppStore";
import {
  RECOVERY_PASSING_SCORE,
  RECOVERY_QUESTIONS,
  WINDOW_OPEN,
  getStudentProfile,
  getWindowStatus,
} from "../../data/recoveryQuestions";
import { RecoveryQuestion } from "../../types";
import { useAntiCheat } from "../../utils/moduleSecurity";
import { postRecoveryResult } from "../../utils/api";

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
      {d > 0 && <CUnit v={d} label="dias" />}
      <CUnit v={h} label="h" />
      <CUnit v={m} label="min" />
      <CUnit v={sec} label="seg" />
    </div>
  );
}

function CUnit({ v, label }: { v: number; label: string }) {
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

function Certificate({ name, score }: { name: string; score: number }) {
  return (
    <div
      className="border-4 border-gold rounded-2xl p-8 text-center bg-gradient-to-b from-[#FEF5E0] to-white shadow-card-lg max-w-md mx-auto"
      style={{ userSelect: "none" }}
    >
      <div className="text-4xl mb-2">🏅</div>
      <p className="font-mono text-[.65rem] tracking-[2px] uppercase text-gold mb-1">
        Certificado de Participação
      </p>
      <h2 className="font-display text-xl font-extrabold text-navy mb-1">
        Geração Tech
      </h2>
      <div className="h-px bg-gold/30 my-3" />
      <p className="text-muted text-sm mb-1">Certificamos que</p>
      <p className="font-bold text-navy text-lg">{name}</p>
      <p className="text-muted text-sm mt-1 mb-3">
        concluiu a <strong>Prova de Recuperação</strong> com aproveitamento de{" "}
        <strong className="text-green">
          {score}/10 ({score * 10}%)
        </strong>
      </p>
      <div className="h-px bg-gold/30 my-3" />
      <p className="text-[.72rem] text-muted">
        {new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>
      <p className="font-mono text-[.65rem] text-gold/70 mt-2">
        Geração Tech — Prova de Recuperação
      </p>
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

const CAT_COLORS: Record<string, string> = {
  HTML: "bg-[#E0EDF8] text-blue",
  CSS: "bg-[#E6F4EE] text-green",
  React: "bg-[#FEF5E0] text-gold",
  JavaScript: "bg-[#FDEAEA] text-red",
  "Banco de Dados": "bg-[#EDE8F8] text-[#5B4A9B]",
};

export default function ProvaRecuperacao() {
  const { state, navigate, setAdminTab } = useApp();
  const windowStatus = getWindowStatus(state.user?.email);
  const isAdminUser =
    state.user?.email?.toLowerCase() === "nazyalmeida@gmail.com";
  const ATTEMPT_VERSION = "reset-v5";

  const submissionKey = `recovery_submitted_${state.user?.email}_${ATTEMPT_VERSION}`;
  const progressKey = `recovery_progress_${state.user?.email}_${ATTEMPT_VERSION}`;

  const loadRecoveryProgress = () => {
    try {
      return JSON.parse(localStorage.getItem(progressKey) || "null");
    } catch {
      return null;
    }
  };

  const saved = loadRecoveryProgress();
  const profile = getStudentProfile(state.user?.email);

  const [started, setStarted] = useState(saved?.started ?? false);
  const [current, setCurrent] = useState(saved?.current ?? 0);
  const [selected, setSelected] = useState<number | null>(
    saved?.selected ?? null,
  );
  const [confirmed, setConfirmed] = useState(saved?.confirmed ?? false);
  const [answers, setAnswers] = useState<(number | null)[]>(
    saved?.answers ?? Array(10).fill(null),
  );
  const [finished, setFinished] = useState(saved?.finished ?? false);
  const [score, setScore] = useState(saved?.score ?? 0);
  const [bestScore, setBestScore] = useState(
    saved?.bestScore ?? saved?.score ?? 0,
  );
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useAntiCheat(
    started && !finished,
    "⚠️ Copiar, colar, selecionar texto, imprimir ou sair da aba não é permitido durante a prova!",
  );

  useEffect(() => {
    if (localStorage.getItem(submissionKey)) setAlreadySubmitted(true);
  }, [submissionKey]);

  useEffect(() => {
    if (!state.user) return;

    localStorage.setItem(
      progressKey,
      JSON.stringify({
        started,
        current,
        selected,
        confirmed,
        answers,
        finished,
        score,
        bestScore,
      }),
    );
  }, [
    started,
    current,
    selected,
    confirmed,
    answers,
    finished,
    score,
    bestScore,
    progressKey,
    state.user,
  ]);

  const q: RecoveryQuestion = RECOVERY_QUESTIONS[current];

  const handleSelect = (idx: number) => {
    if (!confirmed) setSelected(idx);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    const next = [...answers];
    next[current] = selected;
    setAnswers(next);
    setConfirmed(true);
  };

  const handleNext = async () => {
    if (current < RECOVERY_QUESTIONS.length - 1) {
      setCurrent((c: number) => c + 1);
      setSelected(null);
      setConfirmed(false);
      return;
    }

    const finalAnswers = [...answers];
    finalAnswers[current] = selected;

    const finalScore = finalAnswers.filter(
      (answer, index) => answer === RECOVERY_QUESTIONS[index].correct,
    ).length;

    setScore(finalScore);
    setBestScore(finalScore);

    try {
      await postRecoveryResult({
        name: state.user!.name,
        email: state.user!.email,
        course: state.user!.course,
        score: finalScore,
        passed: finalScore >= RECOVERY_PASSING_SCORE,
      });

      localStorage.setItem(
        submissionKey,
        JSON.stringify({
          name: state.user!.name,
          score: finalScore,
          bestScore: finalScore,
          ts: Date.now(),
        }),
      );

      setFinished(true);
      window.dispatchEvent(new Event("ddg:update"));
      window.location.reload();
    } catch (error: any) {
      console.error("Erro ao salvar resultado:", error);

      if (error?.response?.status === 409) {
        localStorage.setItem(
          submissionKey,
          JSON.stringify({
            name: state.user!.name,
            score: finalScore,
            bestScore: finalScore,
            ts: Date.now(),
          }),
        );

        setFinished(true);
        return;
      }

      alert("Seu resultado não foi salvo. Tente novamente.");
    }
  };

  const finalDisplayedScore = bestScore;
  const passed = finalDisplayedScore >= RECOVERY_PASSING_SCORE;

  if (windowStatus === "after") {
    return (
      <WindowMessage
        icon="🔒"
        title="Prova encerrada"
        desc="O período de realização da Prova de Recuperação foi encerrado."
        color="text-red"
        onBack={() => navigate("select")}
      />
    );
  }

  if (windowStatus === "before") {
    return (
      <WindowMessage
        icon="⏳"
        title="Prova ainda não disponível"
        desc="A Prova de Recuperação abrirá no sábado, dia 28, às 08h."
        color="text-gold"
        countdown={<Countdown targetMs={WINDOW_OPEN} />}
        onBack={() => navigate("select")}
      />
    );
  }

  if (alreadySubmitted && !finished) {
    const stored = JSON.parse(localStorage.getItem(submissionKey) || "{}");

    return (
      <WindowMessage
        icon="✅"
        title="Prova já realizada"
        desc={`Você já enviou sua prova nesta janela com nota final de ${stored.score ?? "?"}/10.`}
        color="text-green"
        onBack={() => navigate("select")}
      />
    );
  }

  if (finished) {
    return (
      <div
        className="w-full max-w-[520px] mx-auto animate-scale-in text-center"
        style={{ userSelect: "none" }}
      >
        {isAdminUser && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {
                setAdminTab("dashboard");
                navigate("admin");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-sm font-semibold shadow-sm hover:bg-blue transition-all duration-200"
            >
              ← Voltar para Admin
            </button>
          </div>
        )}

        <div className="bg-surface rounded-card border border-border shadow-card-lg p-8">
          <div className="text-center mb-6">
            <div
              className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center mx-auto mb-4 ${
                passed ? "border-green bg-green-bg" : "border-red bg-red-bg"
              }`}
            >
              <span
                className={`font-mono text-[1.9rem] font-bold ${
                  passed ? "text-green" : "text-red"
                }`}
              >
                {score * 10}%
              </span>
              <span
                className={`text-[.65rem] font-bold uppercase tracking-wide ${
                  passed ? "text-green" : "text-red"
                }`}
              >
                {score}/10
              </span>
            </div>

            <span
              className={`inline-block px-5 py-1 rounded-full font-bold text-[.84rem] uppercase tracking-wide ${
                passed ? "bg-green-bg text-green" : "bg-red-bg text-red"
              }`}
            >
              {passed ? "✅ Aprovado" : "❌ Reprovado"}
            </span>

            <p className="text-navy font-semibold mt-2">{state.user!.name}</p>
            <p className="text-muted text-sm">
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex justify-center mb-5">
            <div className="w-full max-w-[260px] rounded-xl bg-[#EFF4FA] p-4 text-center">
              <p className="text-xs text-muted mb-1">Nota da prova</p>
              <p className="font-mono text-2xl font-bold text-green">
                {score}/10
              </p>
            </div>
          </div>

          <div className="bg-[#EFF4FA] rounded-xl p-4 mb-5 text-sm text-muted">
            Sua nota final corresponde ao total de acertos obtidos na prova ou à
            maior nota que tiver.
          </div>

          {passed ? (
            <>
              <div className="h-px bg-border my-5" />
              <Certificate name={state.user!.name} score={score} />
            </>
          ) : (
            <div className="bg-[#FDEAEA] border border-red/20 rounded-xl p-4 text-center text-sm text-red mt-2">
              Você precisava de pelo menos 6 acertos para ser aprovado.
              <br />
              Continue estudando — você consegue! 💪
            </div>
          )}

          <button
            onClick={() => {
              localStorage.removeItem(progressKey);
              navigate("select");
            }}
            className="mt-6 w-full px-6 py-2.5 bg-navy text-white font-semibold rounded-xl text-sm hover:bg-blue transition-all"
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
          <div className="w-16 h-16 rounded-2xl bg-[#FEF5E0] flex items-center justify-center text-3xl mx-auto mb-4">
            📝
          </div>

          <h2 className="font-display text-2xl font-extrabold text-navy">
            Prova de Recuperação
          </h2>

          <p className="text-muted text-sm mt-2 mb-6 leading-relaxed">
            10 questões objetivas sobre HTML, CSS, React, JavaScript e Banco de
            Dados.
            <br />
            Mínimo de <strong>6 acertos</strong> para aprovação e certificado.
            <br />
            <span className="text-red font-semibold">
              Apenas uma tentativa permitida.
            </span>
          </p>

          <div className="grid grid-cols-2 gap-3 text-left mb-6">
            {[
              ["📌", "10 questões", "Múltipla escolha"],
              ["✅", "60% mínimo", "6 de 10 acertos"],
              ["🏅", "Nota da Prova", "Gerada na hora"],
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
            durante a prova.
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
      className="w-full max-w-[760px] animate-fade-up"
      onCopy={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      style={{ userSelect: "none" }}
    >
      <div className="bg-surface rounded-card border border-border shadow-card-lg p-8">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div>
            <p className="font-mono text-[.68rem] tracking-[1.5px] uppercase text-gold mb-1">
              Questão {current + 1} de {RECOVERY_QUESTIONS.length}
            </p>
            <h2 className="font-display text-xl font-extrabold text-navy">
              Prova de Recuperação
            </h2>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[.74rem] font-bold ${CAT_COLORS[q.category]}`}
          >
            {q.category}
          </span>
        </div>

        <div className="h-2 rounded-full bg-[#EFF4FA] overflow-hidden mb-6">
          <div
            className="h-full bg-blue transition-all duration-500"
            style={{
              width: `${((current + 1) / RECOVERY_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>

        <div className="bg-[#EFF4FA] rounded-2xl p-6 mb-6">
          <p
            className="text-[1.02rem] text-navy font-semibold leading-relaxed"
            dangerouslySetInnerHTML={{ __html: q.text }}
          />
        </div>

        <div className="grid gap-3 mb-6">
          {q.options.map((option, index) => {
            const active = selected === index;

            return (
              <button
                key={option}
                onClick={() => handleSelect(index)}
                disabled={confirmed}
                className={`text-left rounded-xl border px-4 py-3 transition-all ${
                  active
                    ? "border-blue bg-[#EAF3FB] shadow-sm"
                    : "border-border bg-white hover:border-blue"
                } ${confirmed ? "cursor-default" : "cursor-pointer"}`}
              >
                <span className="text-[.82rem] font-semibold text-muted mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-[.92rem] text-navy">{option}</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between gap-3 flex-wrap">
          <button
            onClick={() => navigate("select")}
            className="px-5 py-2.5 border border-navy text-navy font-semibold rounded-xl text-sm hover:bg-navy hover:text-white transition-all"
          >
            Sair
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={selected === null || confirmed}
              className="px-5 py-2.5 border border-blue text-blue font-semibold rounded-xl text-sm hover:bg-blue hover:text-white transition-all disabled:opacity-40"
            >
              Confirmar resposta
            </button>

            <button
              onClick={() => void handleNext()}
              disabled={!confirmed}
              className="px-6 py-2.5 bg-blue text-white font-semibold rounded-xl text-sm hover:bg-navy active:scale-[.97] transition-all disabled:opacity-40"
            >
              {current === RECOVERY_QUESTIONS.length - 1
                ? "Finalizar prova"
                : "Próxima →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}