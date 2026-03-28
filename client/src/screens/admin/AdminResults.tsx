import { useEffect, useMemo, useState } from "react";
import { AdminResultRow } from "../../types";
import { deleteAdminResults, fetchAdminResults } from "../../utils/api";
import { pct } from "../../utils/helpers";
import * as XLSX from "xlsx";

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);

  const escapeCsvValue = (value: unknown) => {
    const str = String(value ?? "");
    if (str.includes('"') || str.includes(";") || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csv = [
    headers.join(";"),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(";"),
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadXlsx(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");
  XLSX.writeFile(workbook, filename);
}

const MODULE_OPTIONS = [
  { value: "all", label: "Todos os módulos" },
  { value: "fullstack", label: "Teste Full-Stack" },
  { value: "recuperacao", label: "Prova de Recuperação" },
  { value: "presenca", label: "Desafio Presença" },
] as const;

export default function AdminResults({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const [rows, setRows] = useState<AdminResultRow[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [moduleFilter, setModuleFilter] =
    useState<(typeof MODULE_OPTIONS)[number]["value"]>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadRows = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminResults();
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows().catch(() => undefined);
    const refresh = () => loadRows().catch(() => undefined);
    window.addEventListener("ddg:update", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("ddg:update", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (Array.isArray(rows) ? rows : []).filter((row) => {
      const moduleMatch = moduleFilter === "all" || row.module === moduleFilter;
      const queryMatch =
        !normalizedQuery ||
        row.name.toLowerCase().includes(normalizedQuery) ||
        row.email.toLowerCase().includes(normalizedQuery) ||
        row.moduleLabel.toLowerCase().includes(normalizedQuery);

      return moduleMatch && queryMatch;
    });
  }, [rows, moduleFilter, query]);

  const exportRows = useMemo(
    () =>
      filteredRows.map((row) => ({
        modulo: row.moduleLabel,
        nome: row.name,
        email: row.email,
        nota: row.score,
        maximo: row.max,
        percentual: `${pct(row.score, row.max)}%`,
        aprovado: row.passed ? "Sim" : "Não",
        data: new Date(row.ts).toLocaleString("pt-BR"),
      })),
    [filteredRows],
  );

  const selectedRows = useMemo(
    () => filteredRows.filter((row) => selected[`${row.module}-${row.id}`]),
    [filteredRows, selected],
  );

  const allVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every((row) => selected[`${row.module}-${row.id}`]);

  const toggleRow = (row: AdminResultRow) => {
    const key = `${row.module}-${row.id}`;
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllVisible = () => {
    const nextValue = !allVisibleSelected;
    setSelected((prev) => {
      const next = { ...prev };
      filteredRows.forEach((row) => {
        next[`${row.module}-${row.id}`] = nextValue;
      });
      return next;
    });
  };

const handleDeleteSelected = async () => {
  if (!selectedRows.length) {
    onToast("⚠️ Selecione pelo menos um resultado.");
    return;
  }

  await deleteAdminResults(
    selectedRows.map((row) => ({ id: row.id, module: row.module })),
  );

  selectedRows.forEach((row) => {
    if (row.module === "recuperacao") {
      Object.keys(localStorage)
        .filter(
          (key) =>
            key.startsWith(`recovery_submitted_${row.email}_`) ||
            key.startsWith(`recovery_progress_${row.email}_`),
        )
        .forEach((key) => localStorage.removeItem(key));
    }

    if (row.module === "presenca") {
      Object.keys(localStorage)
        .filter(
          (key) =>
            key.startsWith(`presenca_submitted_${row.email}_`) ||
            key.startsWith(`presenca_progress_${row.email}_`),
        )
        .forEach((key) => localStorage.removeItem(key));
    }
  });

  setSelected({});
  onToast(`🗑 ${selectedRows.length} resultado(s) removido(s).`);
  await loadRows();
  window.dispatchEvent(new Event("ddg:update"));
};

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="font-display text-[1.3rem] font-extrabold text-navy">
            Resultados
          </h2>
          <p className="text-[.83rem] text-muted">
            Gerencie resultados persistidos de todos os módulos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadRows().catch(() => undefined)}
            className="px-3.5 py-2 border border-border text-muted rounded-xl text-[.78rem] font-semibold hover:border-blue hover:text-blue transition-all"
          >
            Atualizar
          </button>

          <button
            onClick={handleDeleteSelected}
            className="px-3.5 py-2 bg-red text-white rounded-xl text-[.78rem] font-semibold hover:bg-[#8a2020] transition-all disabled:opacity-40"
            disabled={!selectedRows.length}
          >
            Excluir selecionados
          </button>

          <button
            onClick={() => downloadCsv("resultados-admin.csv", exportRows)}
            className="px-4 py-2 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-blue transition-all"
          >
            Exportar CSV
          </button>

          <button
            onClick={() => downloadXlsx("resultados-admin.xlsx", exportRows)}
            className="px-4 py-2 rounded-xl bg-green text-white text-sm font-semibold hover:opacity-90 transition-all"
          >
            Exportar XLSX
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-[14px] border border-border shadow-card p-4 mb-5 grid md:grid-cols-[220px_1fr_auto] gap-3 items-center">
        <select
          value={moduleFilter}
          onChange={(e) =>
            setModuleFilter(
              e.target.value as (typeof MODULE_OPTIONS)[number]["value"],
            )
          }
          className="px-3 py-2.5 border border-border rounded-xl text-[.85rem] outline-none focus:border-blue"
        >
          {MODULE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por aluno, e-mail ou módulo"
          className="px-3 py-2.5 border border-border rounded-xl text-[.85rem] outline-none focus:border-blue"
        />

        <div className="text-[.8rem] text-muted text-right">
          {filteredRows.length} registro(s) • {selectedRows.length}{" "}
          selecionado(s)
        </div>
      </div>

      <div className="bg-surface rounded-[14px] border border-border shadow-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F4F8FC]">
              <th className="px-4 py-3 w-12 text-left">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                />
              </th>
              {["Aluno", "Módulo", "Resultado", "Status", "Data"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-[.72rem] font-bold text-muted uppercase tracking-[.8px]"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(filteredRows) ? filteredRows : []).map((row) => {
              const key = `${row.module}-${row.id}`;
              return (
                <tr
                  key={key}
                  className="border-t border-border hover:bg-[#F8FBFF]"
                >
                  <td className="px-4 py-3 align-top">
                    <input
                      type="checkbox"
                      checked={!!selected[key]}
                      onChange={() => toggleRow(row)}
                    />
                  </td>

                  <td className="px-4 py-3 text-[.82rem] align-top">
                    <strong>{row.name}</strong>
                    <br />
                    <span className="text-muted text-[.75rem]">
                      {row.email}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-[.82rem] align-top">
                    <span className="px-2.5 py-1 rounded-full text-[.7rem] font-bold bg-[#EAF3FB] text-blue whitespace-nowrap">
                      {row.moduleLabel}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-[.82rem] align-top">
                    <strong>
                      {row.score}/{row.max}
                    </strong>
                    <span className="text-muted ml-1">
                      ({pct(row.score, row.max)}%)
                    </span>
                  </td>

                  <td className="px-4 py-3 align-top">
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

                  <td className="px-4 py-3 text-[.82rem] text-muted whitespace-nowrap align-top">
                    {new Date(row.ts).toLocaleString("pt-BR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!filteredRows.length && !loading && (
          <div className="py-16 text-center text-muted text-[.88rem]">
            <div className="text-[2.5rem] mb-2">📭</div>
            Nenhum resultado encontrado.
          </div>
        )}

        {loading && (
          <div className="py-6 text-center text-muted text-[.82rem] border-t border-border">
            Carregando resultados…
          </div>
        )}
      </div>
    </div>
  );
}

