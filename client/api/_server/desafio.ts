// Desafio de Presença do Geração Tech 4.0.
// Cada formação tem uma prova (5 questões objetivas) e um desafio (código ou prompt).
// A nota é a soma dos acertos da prova e do desafio, sobre o total. 75% ou mais recupera a presença.
// Até 2 tentativas por aluno e formação. A correção acontece aqui, no servidor.
import vm from "node:vm";

export const NOTA_MINIMA = 75;
export const LIMITE_TENTATIVAS = 2;
export const MINIMO_CARACTERES_PROMPT = 120;
export const TEMPO_LIMITE_CODIGO_MS = 2000;

export type Curso = "fullstack" | "ia-generativa" | "fullcycle";
export const CURSOS: Curso[] = ["fullstack", "ia-generativa", "fullcycle"];

// Valor de turmas.curso no banco de presença para cada formação do desafio.
export const CURSO_DA_TURMA: Record<string, Curso> = {
  fullstack: "fullstack",
  ia: "ia-generativa",
  fullcycle: "fullcycle",
};

type Teste = { id: string; args: unknown[]; esperado: unknown };
type Questao = { id: string; titulo: string; descricao: string; funcao: string; inicial: string; testes: Teste[] };
type Criterio = { id: string; rotulo: string; padrao: RegExp };
type DesafioCodigo = { titulo: string; nivel: string; tipo: "codigo"; enunciado: string; questoes: Questao[] };
type DesafioPrompt = { titulo: string; nivel: string; tipo: "prompt"; enunciado: string; criterios: Criterio[] };

type QuestaoProva = { id: string; pergunta: string; opcoes: string[]; correta: number; explicacao: string };

// ---------- Provas (5 questões objetivas por formação) ----------
export const PROVAS: Record<Curso, QuestaoProva[]> = {
  fullstack: [
    { id: "p1", pergunta: "Qual tag HTML cria um link?", opcoes: ["<link>", "<a>", "<href>", "<url>"], correta: 1, explicacao: "A tag <a> cria links. O atributo href indica o destino." },
    { id: "p2", pergunta: "Em CSS, qual propriedade altera a cor do texto?", opcoes: ["font-color", "text-color", "color", "background"], correta: 2, explicacao: "A propriedade color define a cor do texto. background define a cor de fundo." },
    { id: "p3", pergunta: "Qual é o resultado de typeof null em JavaScript?", opcoes: ["null", "object", "undefined", "number"], correta: 1, explicacao: "typeof null devolve \"object\", um erro histórico da linguagem. Para testar null, use === null." },
    { id: "p4", pergunta: "No React, como um componente pai passa dados para o filho?", opcoes: ["state", "props", "hooks", "variables"], correta: 1, explicacao: "Props são os dados que o pai passa ao filho. State é o estado interno de um componente." },
    { id: "p5", pergunta: "Em SQL, qual comando busca dados de uma tabela?", opcoes: ["GET", "SELECT", "FETCH", "SHOW"], correta: 1, explicacao: "SELECT busca dados de uma tabela. WHERE filtra as linhas." },
  ],
  "ia-generativa": [
    { id: "p1", pergunta: "O que é um prompt?", opcoes: ["Uma resposta pronta do modelo", "A instrução enviada ao modelo", "O treinamento do modelo", "Um tipo de banco de dados"], correta: 1, explicacao: "Prompt é a instrução enviada ao modelo. Quanto mais clara, melhor a resposta." },
    { id: "p2", pergunta: "Por que dar contexto ao prompt ajuda?", opcoes: ["Deixa o modelo mais lento", "Reduz a precisão", "Ajuda o modelo a entender a situação", "Não faz diferença"], correta: 2, explicacao: "O contexto (público, situação, objetivo) ajuda o modelo a responder de forma relevante." },
    { id: "p3", pergunta: "O que é uma alucinação em IA generativa?", opcoes: ["Falha de conexão", "Resposta incorreta apresentada como verdade", "Erro de tradução", "Modelo que não responde"], correta: 1, explicacao: "Alucinação é quando o modelo inventa algo e apresenta como verdade. Sempre confira." },
    { id: "p4", pergunta: "Qual técnica pede ao modelo que mostre o raciocínio passo a passo?", opcoes: ["Zero-shot", "Chain-of-thought", "Fine-tuning", "Embeddings"], correta: 1, explicacao: "Chain-of-thought pede que o modelo mostre os passos do raciocínio." },
    { id: "p5", pergunta: "Por que é importante revisar a resposta de uma IA?", opcoes: ["Ela nunca erra", "Ela pode errar ou inventar informações", "É proibido usar", "Só vale para textos longos"], correta: 1, explicacao: "Modelos podem errar ou inventar informações. A revisão humana é essencial." },
  ],
  fullcycle: [
    { id: "p1", pergunta: "Qual comando do Git cria um novo branch e muda para ele?", opcoes: ["git branch -d nome", "git checkout -b nome", "git merge nome", "git push nome"], correta: 1, explicacao: "git checkout -b cria um branch e muda para ele. git switch -c faz o mesmo." },
    { id: "p2", pergunta: "No Docker, o que é uma imagem?", opcoes: ["Um container em execução", "Um modelo somente leitura usado para criar containers", "Um volume de dados", "Uma rede virtual"], correta: 1, explicacao: "Uma imagem é um modelo somente leitura. O container é criado a partir dela." },
    { id: "p3", pergunta: "Em uma API REST, qual método atualiza um recurso existente por completo?", opcoes: ["GET", "POST", "PUT", "DELETE"], correta: 2, explicacao: "PUT substitui o recurso por completo. PATCH altera só parte dele." },
    { id: "p4", pergunta: "Qual código HTTP indica que um recurso foi criado com sucesso?", opcoes: ["200", "201", "301", "404"], correta: 1, explicacao: "201 Created indica criação bem-sucedida. 200 é sucesso genérico." },
    { id: "p5", pergunta: "O que é um teste unitário?", opcoes: ["Testa o sistema inteiro pelo navegador", "Testa uma unidade isolada, como uma função", "Testa só o banco de dados", "Testa a velocidade do sistema"], correta: 1, explicacao: "Teste unitário verifica uma unidade isolada, como uma função, de forma rápida." },
  ],
};

// ---------- Guia de estudos (conceitos e exemplos, sem as respostas da prova) ----------
export const GUIAS: Record<Curso, { titulo: string; secoes: { titulo: string; texto: string }[] }> = {
  fullstack: {
    titulo: "Guia · Full Stack",
    secoes: [
      { titulo: "HTML e CSS", texto: "HTML define a estrutura da página, com tags como <a> para links e <h1> a <h6> para títulos. CSS define a aparência: a propriedade color muda a cor do texto e background muda o fundo." },
      { titulo: "JavaScript", texto: "typeof informa o tipo de um valor. Cuidado com typeof null, que devolve \"object\" por um erro histórico da linguagem. Funções transformam listas com map, filter e reduce." },
      { titulo: "React", texto: "Componentes recebem dados do pai por props. O estado interno de um componente é guardado com useState e, quando muda, a tela é atualizada." },
      { titulo: "Banco de dados", texto: "Em SQL, SELECT busca colunas de uma tabela, WHERE filtra as linhas e INSERT grava um novo registro." },
    ],
  },
  "ia-generativa": {
    titulo: "Guia · IA Generativa",
    secoes: [
      { titulo: "Prompt", texto: "Um prompt é a instrução que você envia ao modelo. Um bom prompt diz quem a IA é, qual é a situação, qual tarefa ela deve fazer e em que formato quer a resposta." },
      { titulo: "Contexto e restrições", texto: "Contexto (quem é o público, qual é o objetivo) reduz respostas genéricas. Restrições, como o número máximo de palavras, deixam a resposta mais útil." },
      { titulo: "Alucinações", texto: "Modelos podem inventar fatos com confiança. Sempre confira datas, números, nomes e links antes de usar uma resposta." },
      { titulo: "Raciocínio passo a passo", texto: "Pedir a resolução em etapas (chain-of-thought) costuma melhorar problemas de lógica e de cálculo." },
    ],
  },
  fullcycle: {
    titulo: "Guia · FullCycle",
    secoes: [
      { titulo: "Git", texto: "Branches isolam mudanças. git checkout -b cria um branch e muda para ele. git merge junta o trabalho de um branch em outro." },
      { titulo: "Docker", texto: "Uma imagem é um modelo somente leitura. Um container é uma instância em execução criada a partir dela." },
      { titulo: "API REST", texto: "GET lê, POST cria, PUT substitui um recurso por completo e DELETE remove. Códigos 2xx indicam sucesso, 4xx erro do cliente e 5xx erro do servidor." },
      { titulo: "Testes", texto: "Testes unitários verificam uma unidade isolada, como uma função. Eles são rápidos e ajudam a achar erros logo cedo." },
    ],
  },
};

// ---------- Desafios ----------
export const DESAFIOS: Record<Curso, DesafioCodigo | DesafioPrompt> = {
  fullstack: {
    titulo: "Desafio de Presença · Full Stack",
    nivel: "Iniciante",
    tipo: "codigo",
    enunciado: "Complete cada função no editor. Um teste é considerado certo quando a função devolve exatamente o valor esperado.",
    questoes: [
      {
        id: "q1", titulo: "Somar os números pares", descricao: "Retorne a soma apenas dos números pares da lista.", funcao: "somarPares",
        inicial: "function somarPares(numeros) {\n  // escreva o código aqui\n}",
        testes: [
          { id: "q1-t1", args: [[1, 2, 3, 4, 5, 6]], esperado: 12 },
          { id: "q1-t2", args: [[7, 9]], esperado: 0 },
          { id: "q1-t3", args: [[10, 20]], esperado: 30 },
        ],
      },
      {
        id: "q2", titulo: "Primeira letra maiúscula", descricao: "Deixe só a primeira letra do texto em maiúscula.", funcao: "primeiraMaiuscula",
        inicial: "function primeiraMaiuscula(texto) {\n  // escreva o código aqui\n}",
        testes: [
          { id: "q2-t1", args: ["maria"], esperado: "Maria" },
          { id: "q2-t2", args: [""], esperado: "" },
          { id: "q2-t3", args: ["aluno gt"], esperado: "Aluno gt" },
        ],
      },
      {
        id: "q3", titulo: "Contar vogais", descricao: "Conte as letras a, e, i, o, u (maiúsculas ou minúsculas) do texto.", funcao: "contarVogais",
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
    enunciado: "Escreva um prompt para uma IA generativa. O prompt deve pedir que a IA revise o currículo de um aluno iniciante e deve cobrir os pontos abaixo.",
    criterios: [
      { id: "papel", rotulo: 'Diz quem a IA é (ex.: "Atue como…")', padrao: /(atue como|aja como|voce e|voce atua|assuma o papel)/ },
      { id: "contexto", rotulo: "Explica o contexto (aluno iniciante, currículo)", padrao: /(contexto|aluno|iniciante|curriculo|estudante)/ },
      { id: "tarefa", rotulo: "Descreve a tarefa com um verbo de ação", padrao: /(revise|corrija|reescreva|analise|melhore|avalie|sugira)/ },
      { id: "formato", rotulo: "Pede um formato para a resposta", padrao: /(formato|liste|topicos|tabela|passo a passo|em \d+ )/ },
      { id: "restricoes", rotulo: "Coloca restrições ou limites", padrao: /(nao |evite|limite|no maximo|apenas|somente|sem )/ },
    ],
  },

  fullcycle: {
    titulo: "Desafio de Presença · FullCycle",
    nivel: "Intermediário",
    tipo: "codigo",
    enunciado: "Complete cada função no editor. Os testes cobrem casos comuns e casos extremos (lista vazia, valores zero).",
    questoes: [
      {
        id: "q1", titulo: "Agrupar alunos por curso", funcao: "agruparPorCurso",
        descricao: "Receba uma lista de objetos { nome, curso } e devolva um objeto que mapeia cada curso para a lista de nomes.",
        inicial: "function agruparPorCurso(alunos) {\n  // escreva o código aqui\n}",
        testes: [
          { id: "q1-t1", args: [[{ nome: "Ana", curso: "Node" }, { nome: "Bia", curso: "Node" }, { nome: "Caio", curso: "React" }]], esperado: { Node: ["Ana", "Bia"], React: ["Caio"] } },
          { id: "q1-t2", args: [[]], esperado: {} },
        ],
      },
      {
        id: "q2", titulo: "Maior sequência de presenças", funcao: "maiorSequencia",
        descricao: "Receba uma lista de true (presente) e false (faltou) e devolva o tamanho da maior sequência de true seguidos.",
        inicial: "function maiorSequencia(dias) {\n  // escreva o código aqui\n}",
        testes: [
          { id: "q2-t1", args: [[true, true, false, true, true, true]], esperado: 3 },
          { id: "q2-t2", args: [[]], esperado: 0 },
          { id: "q2-t3", args: [[false, false]], esperado: 0 },
        ],
      },
      {
        id: "q3", titulo: "Paginar uma lista", funcao: "paginar",
        descricao: "Divida a lista em pedaços de tamanho fixo. O último pedaço pode ser menor.",
        inicial: "function paginar(itens, tamanho) {\n  // escreva o código aqui\n}",
        testes: [
          { id: "q3-t1", args: [[1, 2, 3, 4, 5], 2], esperado: [[1, 2], [3, 4], [5]] },
          { id: "q3-t2", args: [[], 3], esperado: [] },
        ],
      },
      {
        id: "q4", titulo: "Porcentagem de presença", funcao: "percentualPresenca",
        descricao: "Receba o número de presenças e de faltas e devolva a porcentagem arredondada. Sem aulas (0 e 0), devolva 0.",
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

// Roda o código do aluno em contexto isolado (sem require, process ou rede), com limite de tempo.
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

const semAcento = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export type DetalheProva = {
  pergunta: string;
  opcoes: string[];
  marcada: number;
  correta: number;
  acertou: boolean;
  explicacao: string;
};

export type DetalheDesafio =
  | { tipo: "codigo"; questoes: { titulo: string; testes: { id: string; args: unknown[]; passou: boolean }[] }[] }
  | { tipo: "prompt"; criterios: { rotulo: string; atendeu: boolean }[] };

export function corrigirPrompt(curso: Curso, texto: string) {
  const desafio = DESAFIOS[curso] as DesafioPrompt;
  const total = desafio.criterios.length;
  const limpo = String(texto ?? "").trim();
  if (limpo.length < MINIMO_CARACTERES_PROMPT) {
    return {
      acertos: 0,
      total,
      motivo: `Escreva um prompt com pelo menos ${MINIMO_CARACTERES_PROMPT} caracteres.`,
      detalhe: { tipo: "prompt" as const, criterios: desafio.criterios.map((c) => ({ rotulo: c.rotulo, atendeu: false })) },
    };
  }
  const normal = semAcento(limpo);
  const criterios = desafio.criterios.map((c) => ({ rotulo: c.rotulo, atendeu: c.padrao.test(normal) }));
  const acertos = criterios.filter((c) => c.atendeu).length;
  return { acertos, total, motivo: "", detalhe: { tipo: "prompt" as const, criterios } };
}

export function corrigirCodigoCurso(curso: Curso, codigos: Record<string, string>) {
  const desafio = DESAFIOS[curso] as DesafioCodigo;
  const resultados = corrigirCodigo(desafio, codigos);
  const ids = desafio.questoes.flatMap((q) => q.testes.map((t) => t.id));
  const acertos = ids.filter((id) => resultados[id] === true).length;
  const questoes = desafio.questoes.map((q) => ({
    titulo: q.titulo,
    testes: q.testes.map((t) => ({ id: t.id, args: t.args, passou: resultados[t.id] === true })),
  }));
  return { acertos, total: ids.length, motivo: "", detalhe: { tipo: "codigo" as const, questoes } };
}

// Nota final: prova (5 questões) + desafio, somados. Inclui o feedback para o aluno.
export function corrigirTudo(curso: Curso, respostas: number[], codigos: Record<string, string>, texto: string) {
  const prova = PROVAS[curso];
  const detalheProva: DetalheProva[] = prova.map((q, i) => ({
    pergunta: q.pergunta,
    opcoes: q.opcoes,
    marcada: respostas[i],
    correta: q.correta,
    acertou: respostas[i] === q.correta,
    explicacao: q.explicacao,
  }));
  const acertosProva = detalheProva.filter((d) => d.acertou).length;

  const desafio = DESAFIOS[curso];
  const d = desafio.tipo === "codigo"
    ? corrigirCodigoCurso(curso, codigos)
    : corrigirPrompt(curso, texto);

  const total = prova.length + d.total;
  const acertos = acertosProva + d.acertos;
  const pct = Math.round((acertos / total) * 100);
  return {
    acertos,
    total,
    pct,
    prova: { acertos: acertosProva, total: prova.length },
    desafio: { acertos: d.acertos, total: d.total },
    motivo: d.motivo,
    feedback: { prova: detalheProva, desafio: d.detalhe as DetalheDesafio },
  };
}

// Versão para o navegador: sem gabarito da prova, sem o esperado dos testes e sem as respostas.
export function desafioParaAluno(curso: Curso) {
  const d = DESAFIOS[curso];
  const base = { titulo: d.titulo, nivel: d.nivel, tipo: d.tipo, enunciado: d.enunciado };
  const prova = PROVAS[curso].map((q) => ({ id: q.id, pergunta: q.pergunta, opcoes: q.opcoes }));
  if (d.tipo === "prompt") {
    return {
      ...base,
      prova,
      criterios: d.criterios.map((c) => ({ id: c.id, rotulo: c.rotulo })),
      minimoCaracteres: MINIMO_CARACTERES_PROMPT,
    };
  }
  return {
    ...base,
    prova,
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
