import { useApp } from "../../hooks/useAppStore";
import { AdminTab } from "../../types";
import AdminDashboard from "./AdminDashboard";
import AdminResults from "./AdminResults";
import AdminQuestions from "./AdminQuestions";
import {
  AdminCode,
  AdminRecs,
  AdminChallenges,
  AdminConfig,
} from "./AdminOtherTabs";

const TABS: { id: AdminTab; icon: string; label: string }[] = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "results", icon: "📋", label: "Resultados" },
  { id: "questions", icon: "✏️", label: "Questões" },
  { id: "code", icon: "💻", label: "Código" },
  { id: "recs", icon: "💡", label: "Recomendações" },
  { id: "challenges", icon: "🎯", label: "Desafios" },
  { id: "config", icon: "⚙️", label: "Configurações" },
];

interface Props {
  onToast: (msg: string) => void;
}

export default function AdminScreen({ onToast }: Props) {
  const { state, setAdminTab, navigate } = useApp();

  const renderTab = () => {
    switch (state.adminTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "results":
        return <AdminResults onToast={onToast} />;
      case "questions":
        return <AdminQuestions onToast={onToast} />;
      case "code":
        return <AdminCode onToast={onToast} />;
      case "recs":
        return <AdminRecs onToast={onToast} />;
      case "challenges":
        return <AdminChallenges onToast={onToast} />;
      case "config":
        return <AdminConfig onToast={onToast} />;
    }
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-58px)]">
      {/* Sidebar */}
      <nav className="w-[220px] bg-navy flex-shrink-0 py-5 sticky top-[58px] h-[calc(100vh-58px)] overflow-y-auto">
        <p className="font-mono text-[.62rem] tracking-[2px] uppercase text-sky/40 px-5 pt-2 pb-1">
          Menu
        </p>

        {TABS.map((t) => (
          <div
            key={t.id}
            onClick={() => setAdminTab(t.id)}
            className={`flex items-center gap-3 px-5 py-2.5 text-[.84rem] cursor-pointer transition-all border-l-2
              ${
                state.adminTab === t.id
                  ? "text-white bg-blue/25 border-l-sky"
                  : "text-white/60 border-l-transparent hover:text-white hover:bg-white/5"
              }`}
          >
            <span className="w-5 text-center">{t.icon}</span>
            <span>{t.label}</span>
          </div>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 p-8 bg-[#EFF4FA] overflow-auto">
        <div className="mb-6 bg-surface rounded-[14px] border border-border shadow-card p-5">
          <p className="font-mono text-[.68rem] tracking-[2px] uppercase text-red mb-2">
            Área de testes do admin
          </p>

          <h3 className="text-[1rem] font-bold text-navy mb-2">
            Acesso rápido para desenvolvimento
          </h3>

          <p className="text-[.82rem] text-muted mb-4">
            Esses botões aparecem só no admin e permitem testar módulos que
            estão bloqueados para os alunos.
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

        {renderTab()}
      </div>
    </div>
  );
}
