import { useApp } from "../hooks/useAppStore";
import { Layout, Screen } from "../types";
import { getWindowStatus, WINDOW_OPEN } from "../data/recoveryQuestions";

const STUDY_ONLY_MODE = false;

const ICONS = ["🌐", "⚡", "🔧"];
const ICON_BG = ["bg-[#E0EDF8]", "bg-green-bg", "bg-gold-bg"];

interface ExtraModule {
  key: Screen;
  icon: string;
  title: string;
  desc: string;
  color: string;
  bgColor: string;
}

const EXTRA_MODULES: ExtraModule[] = [
  {
    key: "recuperacao",
    icon: "📝",
    title: "Prova de Recuperação",
    desc: "10 questões objetivas (HTML, CSS, React, JS, BD). Mínimo 60% para aprovação e certificado.",
    color: "text-gold",
    bgColor: "bg-gold-bg",
  },
  {
    key: "presenca",
    icon: "💻",
    title: "Desafio Presença",
    desc: "Complete um mini projeto de código. O percentual de acertos atualiza sua presença (prevalece a maior).",
    color: "text-blue",
    bgColor: "bg-[#E0EDF8]",
  },
  {
    key: "roteiro",
    icon: "📘",
    title: "Guia Interativo de Estudos",
    desc: "Revise o conteúdo da prova, pratique perguntas com gabarito e veja exemplos guiados do desafio.",
    color: "text-green",
    bgColor: "bg-green-bg",
  },
];

function readStorage(key: string) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

export default function SelectScreen() {
  const { state, db, startChallenge, navigate, setAdminTab } = useApp();
  const windowStatus = getWindowStatus();
  const isWindowOpen = windowStatus === "open";
  const isAdminUser =
    state.user?.email?.toLowerCase() === "nazyalmeida@gmail.com";

  const recoveryKey = `recovery_submitted_${state.user?.email}_${WINDOW_OPEN}`;
  const presencaKey = `presenca_submitted_${state.user?.email}_${WINDOW_OPEN}`;

  const recoveryData = readStorage(recoveryKey);
  const presencaData = readStorage(presencaKey);

  const recoveryDone = !!recoveryData;
  const presencaDone = !!presencaData;

  const recoveryLabel = recoveryDone
    ? `Concluído • Nota ${recoveryData.score}/10`
    : isWindowOpen
      ? "Disponível"
      : windowStatus === "before"
        ? "Abre Sábado 28/03"
        : "Encerrado";

  const presencaLabel = presencaDone
    ? `Concluído • ${presencaData.newPct}%`
    : isWindowOpen
      ? "Disponível"
      : windowStatus === "before"
        ? "Abre Sábado 28/03"
        : "Encerrado";

  return (
    <div className="w-full max-w-[680px] mt-2 animate-fade-up">
      {isAdminUser && (
        <div className="w-full flex justify-end mb-4">
          <button
            onClick={() => {
              setAdminTab("dashboard");
              navigate("admin");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-sm font-semibold shadow-sm hover:bg-blue transition-all duration-200"
          >
            ← Voltar para o painel de admin
          </button>
        </div>
      )}

      <p className="font-mono text-[.68rem] tracking-[2px] uppercase text-blue mb-1">
        Bem-vindo, {state.user!.name.split(" ")[0]}!
      </p>

      <h2 className="font-display text-[1.7rem] font-extrabold text-navy leading-tight">
        Escolha seu Desafio
      </h2>

      <p className="text-muted text-[.88rem] mt-1 mb-5">
        Selecione um desafio para começar. São 5 questões + 1 desafio de código.
      </p>

      {/* Desafios principais */}
      <div className="flex flex-col gap-3.5 mb-7">
        {db.challenges.map((c, i) => (
          <div
            key={c.id}
            onClick={() => c.active && startChallenge(c.id, c.layout as Layout)}
            style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            className={`animate-fade-up flex items-center gap-5 p-5 bg-surface border-[1.5px] border-border rounded-[14px]
              transition-all duration-200
              ${
                c.active
                  ? "cursor-pointer hover:border-blue hover:shadow-[0_6px_24px_rgba(46,109,164,.13)] hover:-translate-y-0.5"
                  : "opacity-50 cursor-not-allowed"
              }`}
          >
            <div
              className={`w-12 h-12 ${ICON_BG[i]} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}
            >
              {ICONS[i]}
            </div>

            <div className="flex-1">
              <h3 className="text-[.95rem] font-bold text-navy">{c.title}</h3>
              <p className="text-[.8rem] text-muted mt-0.5">{c.desc}</p>

              <span
                className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[.7rem] font-bold
                  ${c.active ? "bg-[#E0EDF8] text-blue" : "bg-[#e4eaee] text-slate"}`}
              >
                {c.active ? "Disponível" : "Em breve"}
              </span>
            </div>

            <span className="text-muted text-lg ml-auto">
              {c.active ? "→" : "🔒"}
            </span>
          </div>
        ))}
      </div>

      {/* Divisor */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-[.65rem] tracking-[2px] uppercase text-muted whitespace-nowrap flex items-center gap-2">
          Módulos Especiais
          {isWindowOpen && (
            <span className="inline-flex items-center gap-1 bg-green-bg text-green px-2 py-0.5 rounded-full text-[.6rem] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse inline-block" />
              Aberto até seg 30/03
            </span>
          )}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Área de testes do admin */}
      {isAdminUser && (
        <div className="mt-6 bg-surface rounded-[14px] border border-border shadow-card p-5 mb-6">
          <p className="font-mono text-[.68rem] tracking-[2px] uppercase text-red mb-2">
            Área de testes do admin
          </p>

          <h3 className="text-[1rem] font-bold text-navy mb-2">
            Acesso rápido para desenvolvimento
          </h3>

          <p className="text-[.82rem] text-muted mb-4">
            Esses botões aparecem só para o admin e permitem testar módulos
            bloqueados para os alunos.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("roteiro")}
              className="px-4 py-2 rounded-xl bg-green text-white text-sm font-semibold hover:opacity-90 transition-all"
            >
              Abrir Guia de Estudos
            </button>

            <button
              onClick={() => navigate("recuperacao")}
              className="px-4 py-2 rounded-xl bg-gold text-white text-sm font-semibold hover:opacity-90 transition-all"
            >
              Testar Prova de Recuperação
            </button>

            <button
              onClick={() => navigate("presenca")}
              className="px-4 py-2 rounded-xl bg-blue text-white text-sm font-semibold hover:opacity-90 transition-all"
            >
              Testar Desafio Presença
            </button>
          </div>
        </div>
      )}

      {/* Módulos extras */}
      <div className="flex flex-col gap-3">
        {EXTRA_MODULES.map((m, i) => {
          const isRecovery = m.key === "recuperacao";
          const isPresenca = m.key === "presenca";
          const isRoteiro = m.key === "roteiro";

          const isLockedByStudyMode = STUDY_ONLY_MODE && !isRoteiro;

          const done = isRecovery
            ? recoveryDone
            : isPresenca
              ? presencaDone
              : false;

          const label = isLockedByStudyMode
            ? "Em breve"
            : isRecovery
              ? recoveryLabel
              : isPresenca
                ? presencaLabel
                : "Acesse quando quiser";

          const badgeClass = isLockedByStudyMode
            ? "bg-slate-50 text-slate-500 border-slate-200"
            : done
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : m.key === "roteiro"
                ? "bg-green-bg text-green border-green-bdr"
                : isWindowOpen
                  ? isRecovery
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-sky-50 text-sky-700 border-sky-200"
                  : "bg-slate-50 text-slate-500 border-slate-200";

          return (
            <div
              key={m.key}
              onClick={() => {
                if (isLockedByStudyMode) return;
                navigate(m.key);
              }}
              style={{ animationDelay: `${0.3 + i * 0.08}s` }}
              className={`animate-fade-up flex items-center gap-5 p-5 bg-surface border-[1.5px] border-border rounded-[14px]
                transition-all duration-200
                ${
                  isLockedByStudyMode
                    ? "opacity-75 cursor-not-allowed"
                    : "cursor-pointer hover:border-blue hover:shadow-[0_6px_24px_rgba(46,109,164,.13)] hover:-translate-y-0.5"
                }`}
            >
              <div
                className={`w-12 h-12 ${m.bgColor} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}
              >
                {m.icon}
              </div>

              <div className="flex-1">
                <h3 className="text-[.95rem] font-bold text-navy">{m.title}</h3>
                <p className="text-[.8rem] text-muted mt-0.5">{m.desc}</p>

                <span
                  className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[.72rem] font-semibold shadow-sm border ${badgeClass}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                  {label}
                </span>
              </div>

              <span className="text-muted text-lg ml-auto">
                {isLockedByStudyMode ? "🔒" : "→"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
