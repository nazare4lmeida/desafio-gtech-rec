import { useMemo, useState } from "react";
import { useApp } from "../../hooks/useAppStore";
import { RECOVERY_QUESTIONS } from "../../data/recoveryQuestions";

// --- INTERFACES ---

export interface StudyQuestion {
  id: string;
  topic: string;
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
  source: "prova" | "extra";
}

export interface ChallengeExample {
  id: string;
  title: string;
  level: string;
  goal: string;
  explanation: string;
  starter: string[];
  answer: string[];
  tips: string[];
}

export interface StudyTopic {
  title: string;
  icon: string;
  summary: string;
  points: string[];
  example: string[];
}

// --- CONFIGURAÇÕES DE ESTILO ---

export const TOPIC_STYLES: Record<string, string> = {
  HTML: "bg-[#E0EDF8] text-blue border-[#D0DFF0]",
  CSS: "bg-green-bg text-green border-green-bdr",
  React: "bg-gold-bg text-gold border-gold-bdr",
  JavaScript: "bg-red-bg text-red border-red-bdr",
  "Banco de Dados": "bg-[#EDE8F8] text-[#5B4A9B] border-[#D3CBF3]",
};

// --- DADOS ---

export const EXTRA_QUESTIONS: StudyQuestion[] = [
  {
    id: "extra-1",
    topic: "HTML",
    prompt: "Qual tag HTML é usada para inserir uma imagem em uma página?",
    options: ["<image>", "<img>", "<src>", "<picture-src>"],
    correct: 1,
    explanation:
      "A tag correta é <img>. Ela costuma usar o atributo src para informar o caminho da imagem.",
    source: "extra",
  },
  {
    id: "extra-2",
    topic: "CSS",
    prompt:
      "Qual propriedade CSS é usada para adicionar espaço interno em um elemento?",
    options: ["margin", "spacing", "padding", "border-space"],
    correct: 2,
    explanation:
      "padding controla o espaço interno entre o conteúdo e a borda do elemento.",
    source: "extra",
  },
  {
    id: "extra-3",
    topic: "React",
    prompt:
      "Qual hook do React é comumente usado para executar efeitos colaterais, como buscar dados?",
    options: ["useMemo", "useEffect", "useState", "useReducer"],
    correct: 1,
    explanation:
      "useEffect é usado para efeitos colaterais, como chamadas de API, timers e manipulação do DOM.",
    source: "extra",
  },
  {
    id: "extra-4",
    topic: "JavaScript",
    prompt:
      "Qual método de array cria um novo array transformando cada item do array original?",
    options: ["filter()", "find()", "forEach()", "map()"],
    correct: 3,
    explanation:
      "map() percorre o array e devolve um novo array com cada item transformado.",
    source: "extra",
  },
  {
    id: "extra-5",
    topic: "Banco de Dados",
    prompt:
      "Qual comando SQL é usado para inserir um novo registro em uma tabela?",
    options: ["ADD", "CREATE", "INSERT", "SELECT"],
    correct: 2,
    explanation:
      "INSERT é o comando usado para adicionar novos dados em uma tabela.",
    source: "extra",
  },
];

export const STUDY_TOPICS: StudyTopic[] = [
  {
    title: "HTML",
    icon: "🌐",
    summary: "Aprenda a estrutura da página e o papel das tags principais.",
    points: [
      "Use <p> para parágrafos e <a> para links.",
      "A tag <img> exibe imagens e usa src.",
      "Atributos ajudam a configurar o comportamento dos elementos.",
    ],
    example: [
      "<p>Olá, turma!</p>",
      '<a href="https://geracaotech.example">Abrir portal</a>',
    ],
  },
  {
    title: "CSS",
    icon: "🎨",
    summary: "CSS controla aparência, alinhamento, espaçamento e cores.",
    points: [
      "color altera a cor do texto.",
      "display: inline-block mantém elementos lado a lado com largura e altura.",
      "padding cria espaço interno e margin cria espaço externo.",
    ],
    example: [
      ".titulo { color: #2E6DA4; }",
      ".card { display: inline-block; padding: 16px; }",
    ],
  },
  {
    title: "React",
    icon: "⚛️",
    summary:
      "React organiza a interface em componentes e usa estado para reagir a ações.",
    points: [
      "useState controla estados locais do componente.",
      "JSX mistura HTML com JavaScript usando chaves { }.",
      "useEffect é muito usado para buscar dados e reagir a mudanças.",
    ],
    example: [
      "const [count, setCount] = useState(0)",
      "<button onClick={() => setCount(count + 1)}>{count}</button>",
    ],
  },
  {
    title: "JavaScript",
    icon: "🟨",
    summary:
      "Entenda arrays, funções e comparações para resolver lógica básica.",
    points: [
      "filter() mantém apenas os itens que passam em uma condição.",
      "map() transforma cada item do array.",
      "=== compara valor e tipo ao mesmo tempo.",
    ],
    example: [
      "const pares = numeros.filter(n => n % 2 === 0)",
      "const dobro = numeros.map(n => n * 2)",
    ],
  },
  {
    title: "Banco de Dados",
    icon: "🗄️",
    summary:
      "Banco de dados relacionais usam comandos SQL e identificadores únicos.",
    points: [
      "SELECT busca registros.",
      "INSERT adiciona novos registros.",
      "PRIMARY KEY identifica um registro de forma única.",
    ],
    example: [
      "SELECT * FROM alunos;",
      "INSERT INTO alunos (nome) VALUES ('Ana');",
    ],
  },
];

export const CHALLENGE_EXAMPLES: ChallengeExample[] = [
  {
    id: "principal",
    title: "Desafio principal do sistema",
    level: "Básico",
    goal: "Completar a função para retornar apenas os números pares de um array.",
    explanation:
      "O desafio da plataforma avalia se você entende função, array e filter(). Cada caso de teste confere se sua solução funciona em listas diferentes.",
    starter: [
      "// Desafio: Filtrar Números Pares",
      "function filtrarPares(numeros) {",
      "  // complete aqui",
      "}",
    ],
    answer: [
      "function filtrarPares(numeros) {",
      "  return numeros.filter(n => n % 2 === 0)",
      "}",
    ],
    tips: [
      "Leia o nome da função e o que ela precisa devolver.",
      "Verifique se o retorno final é um novo array.",
      "Teste mentalmente com [1, 2, 3, 4] para ver se saem [2, 4].",
    ],
  },
  {
    id: "extra-soma",
    title: "Exemplo extra 1 — Somar dois números",
    level: "Muito básico",
    goal: "Completar a função para devolver a soma de dois valores.",
    explanation:
      "Esse tipo de exercício treina a leitura da assinatura da função e o uso de return.",
    starter: ["function somar(a, b) {", "  // complete aqui", "}"],
    answer: ["function somar(a, b) {", "  return a + b", "}"],
    tips: [
      "Sem return, a função não devolve o resultado.",
      "A palavra-chave principal aqui é soma.",
    ],
  },
  {
    id: "extra-par",
    title: "Exemplo extra 2 — Verificar se um número é par",
    level: "Básico",
    goal: "Completar a função para retornar true quando o número for par.",
    explanation: "Aqui você pratica operador módulo (%) e comparação estrita.",
    starter: ["function ehPar(numero) {", "  // complete aqui", "}"],
    answer: ["function ehPar(numero) {", "  return numero % 2 === 0", "}"],
    tips: [
      "numero % 2 devolve o resto da divisão por 2.",
      "Se o resto for 0, o número é par.",
    ],
  },
];

// --- COMPONENTES ---
function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <pre className="rounded-2xl bg-[#0F1724] text-[#E6EDF3] text-[.8rem] leading-7 p-4 overflow-x-auto font-mono">
      <code>{lines.join("\n")}</code>
    </pre>
  );
}

export default function StudyGuideScreen() {
  const { navigate } = useApp();
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [openChallengeId, setOpenChallengeId] = useState<string>("principal");

  const questions = useMemo<StudyQuestion[]>(() => {
    const proofQuestions = RECOVERY_QUESTIONS.map((q) => ({
      id: `proof-${q.id}`,
      topic: q.category,
      prompt: q.text.replace(/<code>/g, "").replace(/<\/code>/g, ""),
      options: q.options,
      correct: q.correct,
      explanation: `Resposta correta: ${q.options[q.correct]}. Revise esse tópico e tente justificar por que essa alternativa funciona melhor que as demais.`,
      source: "prova" as const,
    }));

    return [...proofQuestions, ...EXTRA_QUESTIONS];
  }, []);

  const totalAnswered = Object.keys(selectedAnswers).length;
  const totalCorrect = questions.filter(
    (question) => selectedAnswers[question.id] === question.correct,
  ).length;
  const activeChallenge =
    CHALLENGE_EXAMPLES.find((item) => item.id === openChallengeId) ??
    CHALLENGE_EXAMPLES[0];

  return (
    <div className="w-full max-w-[1120px] px-4 py-8 animate-fade-up">
      <button
        onClick={() => navigate("select")}
        className="flex items-center gap-2 mb-4 text-sm font-semibold text-blue hover:underline"
      >
        ← Voltar para seleção
      </button>
      <div className="bg-surface rounded-[24px] border border-border shadow-card p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-mono text-[.68rem] tracking-[2px] uppercase text-blue mb-2">
              Guia interativo de estudos
            </p>
            <h1 className="font-display text-[1.9rem] md:text-[2.2rem] font-extrabold text-navy leading-tight">
              Estude a prova e o desafio dentro do sistema
            </h1>
            <p className="text-muted text-[.95rem] mt-2 max-w-[760px] leading-7">
              Use este roteiro para revisar os temas da prova, praticar
              perguntas com feedback imediato e entender o formato do desafio de
              código.
            </p>
          </div>

          <button
            onClick={() => navigate("select")}
            className="self-start px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-blue transition-all"
          >
            ← Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-2xl border border-border bg-[#EFF4FA] p-4">
            <p className="text-xs uppercase tracking-[2px] text-muted font-mono">
              Plano de estudo
            </p>
            <p className="text-navy font-bold text-lg mt-1">
              3 passos para ir bem
            </p>
            <ol className="mt-3 space-y-2 text-sm text-muted leading-6 list-decimal pl-5">
              <li>
                Leia o resumo de cada tema e copie os exemplos no caderno ou
                editor.
              </li>
              <li>
                Responda as perguntas e reveja a explicação de cada resposta.
              </li>
              <li>
                Pratique os desafios olhando primeiro o enunciado e só depois a
                solução.
              </li>
            </ol>
          </div>

          <div className="rounded-2xl border border-green-bdr bg-green-bg p-4">
            <p className="text-xs uppercase tracking-[2px] text-green font-mono">
              Meta da prova
            </p>
            <p className="text-green font-bold text-3xl mt-1">6 / 10</p>
            <p className="text-sm text-muted mt-2 leading-6">
              Você precisa de pelo menos 6 acertos para aprovação.
            </p>
          </div>

          <div className="rounded-2xl border border-gold-bdr bg-gold-bg p-4">
            <p className="text-xs uppercase tracking-[2px] text-gold font-mono">
              Seu treino aqui
            </p>
            <p className="text-navy font-bold text-3xl mt-1">
              {totalCorrect} acertos
            </p>
            <p className="text-sm text-muted mt-2 leading-6">
              Você respondeu {totalAnswered} de {questions.length} perguntas
              neste guia.
            </p>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="font-display text-[1.45rem] font-extrabold text-navy">
            1. Conteúdo essencial
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {STUDY_TOPICS.map((topic) => (
              <div
                key={topic.title}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#EFF4FA] flex items-center justify-center text-2xl shrink-0">
                    {topic.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-muted mt-1 leading-6">
                      {topic.summary}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-sm text-muted leading-6">
                  {topic.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="text-blue font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  <p className="font-semibold text-navy text-sm mb-2">
                    Exemplo rápido
                  </p>
                  <CodeBlock lines={topic.example} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h2 className="font-display text-[1.45rem] font-extrabold text-navy">
                2. Perguntas para praticar
              </h2>
              <p className="text-muted text-sm mt-1">
                Inclui as 10 perguntas da prova e mais 5 perguntas extras.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => {
              const selected = selectedAnswers[question.id];
              const isRevealed = revealed[question.id];
              const isCorrect = selected === question.correct;
              const chipClass =
                TOPIC_STYLES[question.topic] ??
                "bg-[#EFF4FA] text-navy border-border";

              return (
                <div
                  key={question.id}
                  className="rounded-2xl border border-border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-mono uppercase tracking-[2px] text-muted">
                      Questão {index + 1}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[.7rem] font-bold border ${chipClass}`}
                    >
                      {question.topic}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[.7rem] font-bold border ${question.source === "prova" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-violet-50 text-violet-700 border-violet-200"}`}
                    >
                      {question.source === "prova" ? "Da prova" : "Extra"}
                    </span>
                  </div>

                  <p
                    className="text-navy font-semibold leading-7"
                    dangerouslySetInnerHTML={{ __html: question.prompt }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {question.options.map((option, optionIndex) => {
                      const picked = selected === optionIndex;
                      const showCorrect =
                        isRevealed && optionIndex === question.correct;
                      const showWrong =
                        isRevealed &&
                        picked &&
                        optionIndex !== question.correct;

                      return (
                        <button
                          key={`${question.id}-${optionIndex}`}
                          onClick={() =>
                            setSelectedAnswers((prev) => ({
                              ...prev,
                              [question.id]: optionIndex,
                            }))
                          }
                          className={`text-left rounded-2xl border px-4 py-3 text-sm transition-all ${
                            showCorrect
                              ? "border-green-bdr bg-green-bg text-green"
                              : showWrong
                                ? "border-red-bdr bg-red-bg text-red"
                                : picked
                                  ? "border-blue bg-[#E0EDF8] text-navy"
                                  : "border-border bg-white text-muted hover:border-blue hover:bg-[#F7FAFD]"
                          }`}
                        >
                          <span className="font-bold mr-2">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <code>{option}</code>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() =>
                        setRevealed((prev) => ({
                          ...prev,
                          [question.id]: true,
                        }))
                      }
                      className="px-4 py-2 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-blue transition-all"
                    >
                      Ver resposta e explicação
                    </button>

                    {isRevealed && (
                      <span
                        className={`text-sm font-bold ${isCorrect ? "text-green" : "text-red"}`}
                      >
                        {selected === undefined
                          ? "Você ainda não marcou uma alternativa."
                          : isCorrect
                            ? "Você acertou."
                            : "Você pode revisar essa questão."}
                      </span>
                    )}
                  </div>

                  {isRevealed && (
                    <div className="mt-4 rounded-2xl border border-border bg-[#EFF4FA] p-4 text-sm text-muted leading-7">
                      <p>
                        <span className="font-bold text-navy">Gabarito:</span>{" "}
                        {String.fromCharCode(65 + question.correct)}.{" "}
                        <code>{question.options[question.correct]}</code>
                      </p>
                      <p className="mt-2">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-[1.45rem] font-extrabold text-navy">
            3. Exemplos do desafio
          </h2>
          <p className="text-muted text-sm mt-1">
            Veja o desafio do sistema e mais dois exercícios semelhantes para
            treinar a lógica.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-4 mt-4">
            <div className="rounded-2xl border border-border bg-white p-3 h-fit">
              {CHALLENGE_EXAMPLES.map((challenge) => {
                const active = challenge.id === openChallengeId;
                return (
                  <button
                    key={challenge.id}
                    onClick={() => setOpenChallengeId(challenge.id)}
                    className={`w-full text-left rounded-2xl px-4 py-4 mb-2 last:mb-0 transition-all border ${
                      active
                        ? "border-blue bg-[#E0EDF8]"
                        : "border-transparent hover:border-border hover:bg-[#F7FAFD]"
                    }`}
                  >
                    <p className="font-bold text-navy text-sm">
                      {challenge.title}
                    </p>
                    <p className="text-xs text-muted mt-1">{challenge.level}</p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-navy">
                {activeChallenge.title}
              </h3>
              <p className="text-sm text-muted mt-2 leading-7">
                {activeChallenge.goal}
              </p>
              <p className="text-sm text-muted mt-3 leading-7">
                {activeChallenge.explanation}
              </p>

              <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-navy text-sm mb-2">
                    Código inicial
                  </p>
                  <CodeBlock lines={activeChallenge.starter} />
                </div>
                <div>
                  <p className="font-semibold text-navy text-sm mb-2">
                    Uma solução possível
                  </p>
                  <CodeBlock lines={activeChallenge.answer} />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-[#EFF4FA] p-4">
                <p className="font-semibold text-navy text-sm mb-2">
                  Como pensar na resolução
                </p>
                <ul className="space-y-2 text-sm text-muted leading-6">
                  {activeChallenge.tips.map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span className="text-blue font-bold">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
