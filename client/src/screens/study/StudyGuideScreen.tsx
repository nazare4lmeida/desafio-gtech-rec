import { useEffect, useState } from "react";
import { useApp } from "../../hooks/useAppStore";
import { fetchGuia, GuiaEstudo } from "../../utils/api";

// Guia de estudos da formação do aluno: conceitos para revisar antes do desafio.
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
    <div className="w-full max-w-[720px] mx-auto animate-fade-up">
      <div className="bg-navy rounded-t-card px-8 py-6 text-white">
        <p className="text-xs text-white/60">Guia de Estudos</p>
        <h1 className="font-mono text-xl font-bold">{guia?.titulo ?? "Carregando…"}</h1>
      </div>

      <div className="bg-surface rounded-b-card px-8 py-6 border border-border border-t-0 space-y-5">
        {erro && <p className="text-sm text-red">{erro}</p>}

        {guia?.secoes.map((s) => (
          <section key={s.titulo} className="space-y-1">
            <h2 className="font-semibold text-navy">{s.titulo}</h2>
            <p className="text-sm text-slate leading-relaxed">{s.texto}</p>
          </section>
        ))}

        <button onClick={() => navigate("select")} className="w-full py-2 text-sm text-slate hover:text-navy">
          Voltar
        </button>
      </div>
    </div>
  );
}
