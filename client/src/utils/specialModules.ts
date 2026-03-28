import { RecoveryQuestion } from "../types";

export const WINDOW_OPEN = new Date("2026-03-28T09:00:00").getTime();
export const WINDOW_CLOSE = new Date("2026-03-30T23:59:00").getTime();
export const RECOVERY_PASSING_SCORE = 6;

export const RECOVERY_QUESTIONS: RecoveryQuestion[] = [
  // HTML (2)
  {
    id: 1,
    category: "HTML",
    text: "Qual é a tag HTML correta para criar um parágrafo?",
    options: ["<paragraph>", "<p>", "<para>", "<pg>"],
    correct: 1,
    explanation:
      "A tag <p> é a tag padrão do HTML para representar um parágrafo de texto.",
  },
  {
    id: 2,
    category: "HTML",
    text: "O atributo <code>href</code> é utilizado em qual tag HTML?",
    options: ["<img>", "<link>", "<a>", "<div>"],
    correct: 2,
    explanation:
      "O atributo href é usado principalmente na tag <a> para definir o destino de um link.",
  },

  // CSS (2)
  {
    id: 3,
    category: "CSS",
    text: "Qual propriedade CSS é usada para alterar a cor do texto?",
    options: ["text-color", "font-color", "color", "foreground"],
    correct: 2,
    explanation:
      "A propriedade correta é color. Ela define a cor do texto do elemento.",
  },
  {
    id: 4,
    category: "CSS",
    text: "Qual valor da propriedade <code>display</code> deixa os elementos lado a lado e permite definir largura/altura?",
    options: ["inline", "block", "inline-block", "flex"],
    correct: 2,
    explanation:
      "inline-block mantém os elementos lado a lado e ainda permite definir largura e altura.",
  },

  // React (2)
  {
    id: 5,
    category: "React",
    text: "Qual hook do React é usado para gerenciar estado local em um componente funcional?",
    options: ["useEffect", "useContext", "useState", "useRef"],
    correct: 2,
    explanation:
      "useState é o hook usado para criar e atualizar estado local em componentes funcionais.",
  },
  {
    id: 6,
    category: "React",
    text: "No JSX, como passamos uma expressão JavaScript dentro do HTML?",
    options: [
      'Com aspas duplas " "',
      "Com chaves { }",
      "Com parênteses ( )",
      "Com colchetes [ ]",
    ],
    correct: 1,
    explanation:
      "No JSX, expressões JavaScript devem ser colocadas entre chaves { }.",
  },

  // JavaScript (2)
  {
    id: 7,
    category: "JavaScript",
    text: "Qual método de array cria um novo array com os elementos que passam em um teste?",
    options: ["map()", "find()", "filter()", "reduce()"],
    correct: 2,
    explanation:
      "filter() retorna um novo array contendo apenas os elementos que atendem à condição informada.",
  },
  {
    id: 8,
    category: "JavaScript",
    text: "O que é o operador <code>===</code> em JavaScript?",
    options: [
      "Atribuição de valor",
      "Igualdade apenas de valor (sem verificar tipo)",
      "Igualdade estrita (valor e tipo)",
      "Comparação de referência de objeto",
    ],
    correct: 2,
    explanation:
      "=== faz comparação estrita, verificando tanto o valor quanto o tipo.",
  },

  // Banco de Dados (2)
  {
    id: 9,
    category: "Banco de Dados",
    text: "Qual comando SQL é usado para buscar registros em uma tabela?",
    options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
    correct: 2,
    explanation:
      "SELECT é o comando SQL usado para consultar e buscar registros em uma tabela.",
  },
  {
    id: 10,
    category: "Banco de Dados",
    text: "O que é uma chave primária (PRIMARY KEY) em um banco de dados relacional?",
    options: [
      "Um campo que pode se repetir em várias linhas",
      "Um campo que identifica de forma única cada registro da tabela",
      "Uma senha de acesso ao banco",
      "Um índice opcional para melhorar buscas",
    ],
    correct: 1,
    explanation:
      "PRIMARY KEY é o campo que identifica de forma única cada registro da tabela.",
  },
];

export function getWindowStatus(
  userEmail?: string,
): "before" | "open" | "after" {
  const isAdmin = userEmail?.toLowerCase() === "nazyalmeida@gmail.com";

  if (isAdmin) return "open";

  const now = Date.now();
  if (now < WINDOW_OPEN) return "before";
  if (now > WINDOW_CLOSE) return "after";
  return "open";
}

export function isWindowOpen(userEmail?: string) {
  const isAdmin = userEmail?.toLowerCase() === "nazyalmeida@gmail.com";

  if (isAdmin) return true;

  return getWindowStatus(userEmail) === "open";
}

export interface StudentProfile {
  presencaPct: number;
  coursePct: number;
  projectScore: number;
}

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  presencaPct: 70,
  coursePct: 65,
  projectScore: 0,
};

export function getStudentProfile(email?: string | null): StudentProfile {
  if (!email) return DEFAULT_STUDENT_PROFILE;
  try {
    const raw = JSON.parse(
      localStorage.getItem(`student_profile_${email}`) || "null",
    );
    return {
      presencaPct: Number(
        raw?.presencaPct ?? DEFAULT_STUDENT_PROFILE.presencaPct,
      ),
      coursePct: Number(raw?.coursePct ?? DEFAULT_STUDENT_PROFILE.coursePct),
      projectScore: Number(
        raw?.projectScore ?? DEFAULT_STUDENT_PROFILE.projectScore,
      ),
    };
  } catch {
    return DEFAULT_STUDENT_PROFILE;
  }
}

export function saveStudentProfile(
  email: string,
  profile: Partial<StudentProfile>,
) {
  const current = getStudentProfile(email);
  localStorage.setItem(
    `student_profile_${email}`,
    JSON.stringify({ ...current, ...profile }),
  );
}