import { useEffect, useMemo, useState } from "react";
import { AdminResultRow, AdminStats } from "../../types";
import { pct } from "../../utils/helpers";
import { fetchAdminResults, fetchStats } from "../../utils/api";

const emptyStats: AdminStats = {
  total: 0,
  passed: 0,
  failed: 0,
  avgPct: 0,
  categories: {},
  modules: { fullstack: 0, recovery: 0, presenca: 0 },
  recovery: { total: 0, passed: 0 },
  presenca: { total: 0, avgPct: 0 },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [latest, setLatest] = useState<AdminResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, resultsData] = await Promise.all([
        fetchStats(),
        fetchAdminResults(),
      ]);

      setStats({
        ...emptyStats,
        ...(statsData ?? {}),
        modules: {
          ...emptyStats.modules,
          ...(statsData?.modules ?? {}),
        },
        recovery: {
          ...emptyStats.recovery,
          ...(statsData?.recovery ?? {}),
        },
        presenca: {
          ...emptyStats.presenca,
          ...(statsData?.presenca ?? {}),
        },
        categories: statsData?.categories ?? {},
      });

      setLatest((resultsData ?? []).slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => undefined);

    const refresh = () => {
      loadData().catch(() => undefined);
    };

    window.addEventListener("ddg:update", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("ddg:update", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        val: stats.total,
        label: "Total de Submissões",
        accent: "border-t-blue",
      },
      { val: stats.passed, label: "Aprovados", accent: "border-t-green" },
      { val: stats.failed, label: "Reprovados", accent: "border-t-red" },
      {
        val: `${stats.avgPct}%`,
        label: "Média Geral",
        accent: "border-t-gold",
      },
      {
        val: stats.modules.recovery,
        label: "Recuperação",
        accent: "border-t-gold",
      },
      {
        val: stats.modules.presenca,
        label: "Presença",
        accent: "border-t-blue",
      },
    ],
    [stats],
  );

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="font-display text-[1.3rem] font-extrabold text-navy">
            Dashboard
          </h2>
          <p className="text-[.83rem] text-muted">
            Visão geral consolidada dos módulos e testes.
          </p>
          <p className="text-[.74rem] text-muted mt-1">
            Painel agora lê os resultados persistidos pela API, incluindo
            Recuperação e Desafio Presença.
          </p>
        </div>

        <button
          onClick={() => loadData().catch(() => undefined)}
          className="px-3.5 py-2 border border-border text-muted rounded-xl text-[.78rem] font-semibold hover:border-blue hover:text-blue transition-all"
        >
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-surface rounded-[14px] p-5 border border-border shadow-card border-t-[3px] ${card.accent}`}
          >
            <div className="font-display text-[2rem] font-extrabold text-navy">
              {card.val}
            </div>
            <div className="text-[.78rem] text-muted mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-5 mb-6">
        <div className="bg-surface rounded-[14px] border border-border shadow-card p-5">
          <h3 className="font-bold text-navy mb-4">Resumo por módulo</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              [
                "Teste Full-Stack",
                stats.modules.fullstack,
                "text-blue",
                "bg-[#EAF3FB]",
              ],
              [
                "Prova de Recuperação",
                stats.recovery.total,
                "text-gold",
                "bg-gold-bg",
              ],
              [
                "Desafio Presença",
                stats.presenca.total,
                "text-green",
                "bg-green-bg",
              ],
            ].map(([label, value, textClass, bgClass]) => (
              <div key={String(label)} className={`rounded-xl p-4 ${bgClass}`}>
                <div className={`text-sm font-bold ${textClass}`}>{label}</div>
                <div className="text-2xl font-display font-extrabold text-navy mt-2">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-[14px] border border-border shadow-card p-5">
          <h3 className="font-bold text-navy mb-4">Indicadores rápidos</h3>
          <div className="space-y-3 text-[.83rem]">
            <div className="flex items-center justify-between rounded-xl bg-[#EFF4FA] p-3">
              <span className="text-muted">Aprovação na recuperação</span>
              <strong className="text-navy">
                {stats.recovery.total
                  ? `${Math.round((stats.recovery.passed / stats.recovery.total) * 100)}%`
                  : "0%"}
              </strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#EFF4FA] p-3">
              <span className="text-muted">Média da presença</span>
              <strong className="text-navy">{stats.presenca.avgPct}%</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#EFF4FA] p-3">
              <span className="text-muted">Categorias monitoradas</span>
              <strong className="text-navy">
                {Object.keys(stats.categories).length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-[14px] border border-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <span className="text-[.9rem] font-bold text-navy">
            Últimas Submissões
          </span>
          {loading && (
            <span className="text-[.72rem] text-muted">Atualizando…</span>
          )}
        </div>

        {latest.length ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F4F8FC]">
                {["Aluno", "Módulo", "Nota", "Status", "Data"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[.72rem] font-bold text-muted uppercase tracking-[.8px]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {latest.map((row) => (
                <tr
                  key={`${row.module}-${row.id}`}
                  className="border-t border-border hover:bg-[#F8FBFF]"
                >
                  <td className="px-4 py-3 text-[.82rem]">
                    <strong>{row.name}</strong>
                    <br />
                    <span className="text-muted text-[.75rem]">
                      {row.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[.82rem]">
                    <span className="px-2.5 py-1 rounded-full text-[.7rem] font-bold bg-[#EAF3FB] text-blue whitespace-nowrap">
                      {row.moduleLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[.82rem]">
                    <strong>
                      {row.score}/{row.max}
                    </strong>
                    <span className="text-muted ml-1">
                      ({pct(row.score, row.max)}%)
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[.7rem] font-bold ${
                        row.passed
                          ? "bg-green-bg text-green"
                          : "bg-red-bg text-red"
                      }`}
                    >
                      {row.passed ? "Aprovado" : "Reprovado"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[.82rem] text-muted whitespace-nowrap">
                    {new Date(row.ts).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-muted text-[.88rem]">
            <div className="text-[2.5rem] mb-2">📭</div>
            Nenhuma submissão ainda.
          </div>
        )}
      </div>
    </div>
  );
}
