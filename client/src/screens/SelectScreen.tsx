import { useApp } from "../hooks/useAppStore";

const isAdminEmail = (email?: string) => email?.toLowerCase() === "nazyalmeida@gmail.com";

export default function SelectScreen() {
  const { state, navigate, setAdminTab } = useApp();
  const isAdminUser = isAdminEmail(state.user?.email);

  const cards = [
    {
      key: "presenca" as const,
      icon: "💻",
      title: "Desafio de Presença",
      desc: "Prova com 5 questões e um desafio prático da sua formação. Acertos acima de 75% recuperam sua presença.",
      bg: "bg-[#E0EDF8]",
      badge: "Liberado",
      badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    },
    {
      key: "roteiro" as const,
      icon: "📘",
      title: "Guia de Estudos",
      desc: "Revise os conceitos da sua formação antes do desafio e veja exemplos guiados.",
      bg: "bg-green-bg",
      badge: "Acesse quando quiser",
      badgeClass: "bg-green-bg text-green border-green-bdr",
    },
  ];

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

      <h2 className="font-display text-[1.7rem] font-extrabold text-navy leading-tight mb-5">
        Desafio de Presença
      </h2>

      <div className="flex flex-col gap-3">
        {cards.map((m, i) => (
          <div
            key={m.key}
            onClick={() => navigate(m.key)}
            style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            className="animate-fade-up flex items-center gap-5 p-5 bg-surface border-[1.5px] border-border rounded-[14px] cursor-pointer transition-all duration-200 hover:border-blue hover:shadow-[0_6px_24px_rgba(46,109,164,.13)] hover:-translate-y-0.5"
          >
            <div className={`w-12 h-12 ${m.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
              {m.icon}
            </div>

            <div className="flex-1">
              <h3 className="text-[.95rem] font-bold text-navy">{m.title}</h3>
              <p className="text-[.8rem] text-muted mt-0.5">{m.desc}</p>
              <span
                className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[.72rem] font-semibold shadow-sm border ${m.badgeClass}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {m.badge}
              </span>
            </div>

            <span className="text-muted text-lg ml-auto">→</span>
          </div>
        ))}
      </div>

      {isAdminUser && (
        <div className="mt-6 bg-surface rounded-[14px] border border-border shadow-card p-5">
          <p className="font-mono text-[.68rem] tracking-[2px] uppercase text-red mb-3">
            Área de testes do admin
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("roteiro")}
              className="px-4 py-2 rounded-xl bg-green text-white text-sm font-semibold hover:opacity-90 transition-all"
            >
              Abrir Guia de Estudos
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
    </div>
  );
}
