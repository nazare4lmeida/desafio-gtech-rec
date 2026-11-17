import { useEffect, useState } from "react";
import { useApp } from "../../hooks/useAppStore";
import { fetchGuia, GuiaEstudo } from "../../utils/api";

// Guia de estudos da formação do aluno: conceitos, analogias e exemplos dos assuntos dos desafios.
export default function StudyGuideScreen() {
  const { state, navigate } = useApp();
  const [guia, setGuia] = useState<GuiaEstudo | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!state.user?.course) return;
    fetchGuia(state.user.course)
      .then(setGuia)
      .catch(() => setErro("Não foi possível carregar o guia agora."));
  }, [state.user?.course]);

  return (
    <div className="w-full max-w-[760px] mx-auto animate-fade-up">
      <div className="rounded-t-[18px] bg-gradient-to-br from-navy to-blue px-8 py-7 text-white">
        <p className="text-xs uppercase tracking-[2px] text-white/60">Guia de Estudos</p>
        <h1 className="font-display text-2xl font-extrabold mt-1">{guia?.titulo ?? "Carregando…"}</h1>
        {guia?.intro && <p className="text-sm text-white/80 mt-2 leading-relaxed">{guia.intro}</p>}
      </div>

      <div className="bg-surface rounded-b-[18px] border border-border border-t-0 shadow-card p-6 space-y-4">
        {erro && <p className="text-sm text-red">{erro}</p>}

        {guia?.secoes.map((s, i) => (
          <section key={s.titulo} className="rounded-[14px] border border-border p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#E0EDF8] text-blue text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <h2 className="font-semibold text-navy">{s.titulo}</h2>
            </div>

            <p className="text-sm text-slate leading-relaxed">{s.conceito}</p>

            <div className="rounded-xl bg-gold-bg px-4 py-3 text-sm text-navy">
              <span className="font-semibold">Pense assim: </span>
              {s.analogia}
            </div>

            <pre className="overflow-x-auto rounded-xl bg-[#0F1B2D] text-[#E6F0FA] p-4 text-[.8rem] leading-relaxed font-mono whitespace-pre">
              {s.exemplo}
            </pre>
          </section>
        ))}

        <button
          onClick={() => navigate("select")}
          className="w-full py-3 rounded-xl bg-navy text-white font-semibold hover:bg-blue transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
