import { Difficulty } from "../types";

export const pct = (score: number, max: number) =>
  Math.round((score / max) * 100);

export const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const diffLabel = (d: Difficulty): string => {
  const map: Record<Difficulty, string> = {
    beginner: "Principiante",
    "beginner+": "Principiante+",
    intermediate: "Intermediário",
    hard: "Difícil",
  };
  return map[d] ?? d;
};

export const diffClass = (d: Difficulty): string => {
  const map: Record<Difficulty, string> = {
    beginner: "bg-green-bg text-green",
    "beginner+": "bg-green-bg text-green",
    intermediate: "bg-gold-bg text-gold",
    hard: "bg-red-bg text-red",
  };
  return map[d] ?? "";
};

import { StudentResult } from "../types";

export function exportCSV(rows: StudentResult[]) {
  if (!rows.length) return false;

  const esc = (value: unknown) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const header = [
    "Nome",
    "Email",
    "Nota",
    "Máx",
    "%",
    "Aprovado",
    "Data",
    "frontend%",
    "backend%",
    "lógica%",
    "geral%",
  ];

  const lines = rows.map((r) => [
    r.name,
    r.email,
    r.score,
    r.max,
    `${pct(r.score, r.max)}%`,
    r.passed ? "Sim" : "Não",
    new Date(r.ts).toLocaleDateString("pt-BR"),
    r.cats?.frontend ? `${pct(r.cats.frontend.c, r.cats.frontend.t)}%` : "",
    r.cats?.backend ? `${pct(r.cats.backend.c, r.cats.backend.t)}%` : "",
    r.cats?.["lógica"] ? `${pct(r.cats["lógica"].c, r.cats["lógica"].t)}%` : "",
    r.cats?.geral ? `${pct(r.cats.geral.c, r.cats.geral.t)}%` : "",
  ]);

  const csv = [
    header.map(esc).join(";"),
    ...lines.map((line) => line.map(esc).join(";")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "devdeskgame_resultados.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return true;
}

export const runCodeTests = (
  code: string,
  tests: import("../types").TestCase[],
) =>
  tests.map((t) => {
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(
        code + `; return somaArray([${t.input.join(",")}]);`,
      );
      const got = fn();
      return { pass: got === t.expected, label: t.label, got };
    } catch (e: unknown) {
      return {
        pass: false,
        label: t.label,
        got: `Erro: ${(e as Error).message}`,
      };
    }
  });
