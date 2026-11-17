// Desafio de Presença do Geração Tech 4.0.
// Até 2 tentativas por aluno e formação. Com 75% ou mais, a presença final é a MAIOR
// entre a presença atual e a do desafio. A correção acontece aqui, no servidor.
import vm from "node:vm";

export const NOTA_MINIMA = 75;
export const LIMITE_TENTATIVAS = 2;
export const MINIMO_CARACTERES_PROMPT = 120;
export const TEMPO_LIMITE_CODIGO_MS = 2000;

export type Curso = "fullstack" | "ia-generativa" | "ia-soft-skills" | "fullcycle";
export const CURSOS: Curso[] = ["fullstack", "ia-generativa", "ia-soft-skills", "fullcycle"];

type Teste = { id: string; args: unknown[]; esperado: unknown };
type Questao = { id: string; titulo: string; descricao: string; funcao: string; inicial: string; testes: Teste[] };
type Criterio = { id: string; rotulo: string; padrao: RegExp };

type DesafioCodigo = {
  titulo: string;
  nivel: string;
  tipo: "codigo";
  enunciado: string;
  questoes: Questao[];
};
type DesafioPrompt = {
  titulo: string;
  nivel: string;
  tipo: "prompt";
  enunciado: string;
  criterios: Criterio[];
};

export const DESAFIOS: Record<Curso, DesafioCodigo | DesafioPrompt> = {
  fullstack: {
    titulo: "Desafio de Presença · Full Stack",
    nivel: "Iniciante",
    tipo: "codigo",
    enunciado:
      "Complete cada função no editor. Um teste é considerado certo quando a função devolve exatamente o valor esperado.",
    questoes: [
      {
        id: "q1",
        titulo: "Somar os números pares",
        descricao: "Retorne a soma apenas dos números pares da lista.",
        funcao: "somarPares",
        inicial: "function somarPares(numeros) {\n  // escreva o código aqui\n}",
        testes: [
          { id: "q1-t1", args: [[1, 2, 3, 4, 5, 6]], esperado: 12 },
          { id: "q1-t2", args: [[7, 9]], esperado: 0 },
          { id: "q1-t3", args: [[10, 20]], esperado: 30 },
        ],
      },
      {
        id: "q2",
        titulo: "Primeira letra maiúscula",
        descricao: "Deixe só a primeira letra do texto em maiúscula.",
        funcao: "primeiraMaiuscula",
        inicial: "function primeiraMaiuscula(texto) {\n  // escreva o código aqui\n}",
        testes: [
          { id: "q2-t1", args: ["maria"], esperado: "Maria" },
          { id: "q2-t2", args: [""], esperado: "" },
          { id: "q2-t3", args: ["aluno gt"], esperado: "Aluno gt" },
        ],
      },
      {
        id: "q3",
        titulo: "Contar vogais",
        descricao: "Conte as letras a, e, i, o, u (maiúsculas ou minúsculas) do texto.",
        funcao: "contarVogais",
        inicial: "function contarVogais(texto) {\n  // escreva o código aqui\n}",
        testes: [
          { id: "q3-t1", args: ["Bom dia"], esperado: 3 },
          { id: "q3-t2", args: ["AEIOU"], esperado: 5 },
          { id: "q3-t3", args: ["xyz"], esperado: 0 },
        ],
      },
    ],
  },

  "ia-generativa": {
    titulo: "Desafio de Presença · IA Generativa",
    nivel: "Iniciante",
    tipo: "prompt",
    enunciado:
      "Escreva um prompt para uma IA generativa. O prompt deve pedir que a IA revise o currículo de um aluno iniciante e deve cobrir os pontos abaixo.",
    criterios: [
      { id: "papel", rotulo: 'Diz quem a IA é (ex.: "Atue como…")', padrao: /(atue como|aja como|voce e|voce atua|assuma o papel)/ },
      { id: "contexto", rotulo: "Explica o contexto (aluno iniciante, currículo)", padrao: /(contexto|aluno|iniciante|curriculo|estudante)/ },
      { id: "tarefa", rotulo: "Descreve a tarefa com um verbo de ação", padrao: /(revise|corrija|reescreva|analise|melhore|avalie|sugira)/ },
      { id: "formato", rotulo: "Pede um formato para a resposta", padrao: /(formato|liste|topicos|tabela|passo a passo|em \d+ )/ },
      { id: "restricoes", rotulo: "Coloca restrições ou limites", padrao: /(nao |evite|limite|no maximo|apenas|somente|sem )/ },
    ],
  },

  "ia-soft-skills": {
    titulo: "Desafio de Presença · IA + Soft Skills",
    nivel: "Iniciante",
    tipo: "prompt",
    enunciado:
      "Escreva um prompt para uma IA generativa ajudar um aluno a treinar uma habilidade comportamental (comunicação, trabalho em equipe ou resolução de conflitos). O prompt deve cobrir os pontos abaixo.",
    criterios: [
      { id: "papel", rotulo: 'Diz quem a IA é (ex.: "Atue como…")', padrao: /(atue como|aja como|voce e|voce atua|assuma o papel)/ },
      { id: "contexto", rotulo: "Explica a situação (equipe, colega, apresentação, entrevista)", padrao: /(equipe|colega|apresentacao|entrevista|reuniao|grupo|time)/ },
      { id: "tarefa", rotulo: "Descreve a tarefa com um verbo de ação", padrao: /(simule|treine|pratique|explique|oriente|sugira|prepare)/ },
      { id: "formato", rotulo: "Pede um formato para a resposta", padrao: /(formato|liste|topicos|passo a passo|em \d+ )/ },
      { id: "restricoes", rotulo: "Coloca restrições ou limites", padrao: /(nao |evite|limite|no maximo|apenas|somente|sem )/ },
    ],
  },

  fullcycle: {
    titulo: "Desafio de Presença · FullCycle",
    nivel: "Intermediário",
    tipo: "codigo",
    enunciado:
      "Complete cada função no editor. Os testes cobrem casos comuns e casos extremos (lista vazia, valores zero).",
    questoes: [
      {
        id: "q1",
        titulo: "Agrupar alunos por curso",
        descricao:
          "Receba uma lista de objetos { nome, curso } e devolva um objeto que mapeia cada curso para a lista de nomes.",
        funcao: "agruparPorCurso",
        inicial: "function agruparPorCurso(alunos) {\n  // escreva o código aqui\n}",
        testes: [
          {
            id: "q1-t1",
            args: [[{ nome: "Ana", curso: "Node" }, { nome: "Bia", curso: "Node" }, { nome: "Caio", curso: "React" }]],
            esperado: { Node: ["Ana", "Bia"], React: ["Caio"] },
          },
          { id: "q1-t2", args: [[]], esperado: {} },
        ],
      },
      {
        id: "q2",
        titulo: "Maior sequência de presenças",
        descricao:
          "Receba uma lista de true (presente) e false (faltou) e devolva o tamanho da maior sequência de true seguidos.",
        funcao: "maiorSequencia",
        inicial: "function maiorSequencia(dias) {\n  // escreva o código aqui\n}",
        testes: [
          { id: "q2-t1", args: [[true, true, false, true, true, true]], esperado: 3 },
          { id: "q2-t2", args: [[]], esperado: 0 },
          { id: "q2-t3", args: [[false, false]], esperado: 0 },
        ],
      },
      {
        id: "q3",
        titulo: "Paginar uma lista",
        descricao: "Divida a lista em pedaços de tamanho fixo. O último pedaço pode ser menor.",
        funcao: "paginar",
        inicial: "function paginar(itens, tamanho) {\n  // escreva o código aqui\n}",
        testes: [
          { id: "q3-t1", args: [[1, 2, 3, 4, 5], 2], esperado: [[1, 2], [3, 4], [5]] },
          { id: "q3-t2", args: [[], 3], esperado: [] },
        ],
      },
      {
        id: "q4",
        titulo: "Porcentagem de presença",
        descricao:
          "Receba o número de presenças e de faltas e devolva a porcentagem arredondada. Sem aulas (0 e 0), devolva 0.",
        funcao: "percentualPresenca",
        inicial: "function percentualPresenca(presencas, faltas) {\n  // escreva o código aqui\n}",
        testes: [
          { id: "q4-t1", args: [3, 1], esperado: 75 },
          { id: "q4-t2", args: [0, 0], esperado: 0 },
          { id: "q4-t3", args: [1, 2], esperado: 33 },
        ],
      },
    ],
  },
};

export function ehCurso(valor: unknown): valor is Curso {
  return typeof valor === "string" && (CURSOS as string[]).includes(valor);
}

// Igualdade profunda, sem depender da ordem das chaves.
export function iguais(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => iguais((a as any)[k], (b as any)[k]));
}

// Roda o código do aluno em um contexto isolado (sem require, process ou rede),
// com limite de tempo por teste. Erro de sintaxe ou execução conta como erro.
export function corrigirCodigo(desafio: DesafioCodigo, codigos: Record<string, string>): Record<string, boolean> {
  const resultados: Record<string, boolean> = {};
  for (const q of desafio.questoes) {
    const fonte = String(codigos[q.id] ?? "");
    for (const t of q.testes) {
      let ok = false;
      try {
        const contexto = vm.createContext({ args: t.args });
        const chamada = `(function(){\n${fonte}\n;return ${q.funcao}(...args);})()`;
        const retorno = vm.runInContext(chamada, contexto, { timeout: TEMPO_LIMITE_CODIGO_MS });
        ok = iguais(retorno, t.esperado);
      } catch {
        ok = false;
      }
      resultados[t.id] = ok;
    }
  }
  return resultados;
}

const semAcento = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function corrigirPrompt(curso: Curso, texto: string) {
  const desafio = DESAFIOS[curso] as DesafioPrompt;
  const total = desafio.criterios.length;
  const limpo = String(texto ?? "").trim();
  if (limpo.length < MINIMO_CARACTERES_PROMPT) {
    return { acertos: 0, total, pct: 0, motivo: `Escreva um prompt com pelo menos ${MINIMO_CARACTERES_PROMPT} caracteres.` };
  }
  const normal = semAcento(limpo);
  const acertos = desafio.criterios.filter((c) => c.padrao.test(normal)).length;
  return { acertos, total, pct: Math.round((acertos / total) * 100), motivo: "" };
}

export function corrigirCodigoCurso(curso: Curso, codigos: Record<string, string>) {
  const desafio = DESAFIOS[curso] as DesafioCodigo;
  const resultados = corrigirCodigo(desafio, codigos);
  const ids = desafio.questoes.flatMap((q) => q.testes.map((t) => t.id));
  const acertos = ids.filter((id) => resultados[id] === true).length;
  return { acertos, total: ids.length, pct: Math.round((acertos / ids.length) * 100) };
}

// Versão para o navegador: sem gabarito do prompt e sem o esperado dos testes.
export function desafioParaAluno(curso: Curso) {
  const d = DESAFIOS[curso];
  const base = { titulo: d.titulo, nivel: d.nivel, tipo: d.tipo, enunciado: d.enunciado };
  if (d.tipo === "prompt") {
    return {
      ...base,
      criterios: d.criterios.map((c) => ({ id: c.id, rotulo: c.rotulo })),
      minimoCaracteres: MINIMO_CARACTERES_PROMPT,
    };
  }
  return {
    ...base,
    questoes: d.questoes.map((q) => ({
      id: q.id,
      titulo: q.titulo,
      descricao: q.descricao,
      funcao: q.funcao,
      inicial: q.inicial,
      testes: q.testes.map((t) => ({ id: t.id, args: t.args })),
    })),
  };
}
