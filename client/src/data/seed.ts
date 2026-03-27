import { Question, CodeChallenge, Challenge, StudentResult } from '../types'

 export const QUESTIONS: Question[] = [
{
  id: 1, order: 1, difficulty: 'beginner', category: 'frontend',
  text: 'Qual tag HTML é usada para criar um link clicável?',
  options: ['&lt;link&gt;', '&lt;a&gt;', '&lt;href&gt;', '&lt;button&gt;'],
  correct: 1,
  feedbackOk:  '<strong>Correto!</strong> <code>&lt;a&gt;</code> é a tag de âncora do HTML, usada com <code>href</code> para o destino do link.',
  feedbackNok: '<strong>Quase!</strong> A tag correta é <code>&lt;a&gt;</code>. <code>&lt;link&gt;</code> é usada no <code>&lt;head&gt;</code> para referenciar arquivos externos.',
},
  {
    id: 2, order: 2, difficulty: 'beginner', category: 'geral',
    text: 'O que significa a sigla CSS?',
    options: ['Creative Style Sheets', 'Computer Style System', 'Cascading Style Sheets', 'Coded Style Sheets'],
    correct: 2,
    feedbackOk:  '<strong>Correto!</strong> CSS = Cascading Style Sheets — linguagem usada para estilizar páginas HTML.',
    feedbackNok: '<strong>Quase!</strong> CSS = Cascading Style Sheets. "Cascading" refere-se à aplicação em cascata dos estilos.',
  },
  {
    id: 3, order: 3, difficulty: 'intermediate', category: 'lógica',
    text: 'Qual é o resultado de <code>typeof null</code> em JavaScript?',
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correct: 2,
    feedbackOk:  '<strong>Correto!</strong> É um bug histórico do JS. <code>typeof null</code> retorna <code>"object"</code> por retrocompatibilidade.',
    feedbackNok: '<strong>Quase!</strong> <code>typeof null</code> retorna <code>"object"</code> — bug antigo mantido para retrocompatibilidade.',
  },
  {
    id: 4, order: 4, difficulty: 'intermediate', category: 'backend',
    text: 'Em uma API REST, qual método HTTP é usado para atualizar parcialmente um recurso?',
    options: ['PUT', 'POST', 'DELETE', 'PATCH'],
    correct: 3,
    feedbackOk:  '<strong>Correto!</strong> <code>PATCH</code> atualiza parcialmente. <code>PUT</code> substitui o recurso inteiro.',
    feedbackNok: '<strong>Quase!</strong> O método correto é <code>PATCH</code>. <code>PUT</code> substitui completamente; <code>PATCH</code> altera só os campos enviados.',
  },
  {
    id: 5, order: 5, difficulty: 'hard', category: 'frontend',
    text: 'O que é o Virtual DOM no React e qual sua principal vantagem?',
    options: [
      'Um banco de dados virtual que armazena componentes',
      'Uma cópia leve do DOM real usada para calcular mudanças mínimas antes de atualizar o DOM real',
      'Um sistema de cache para requisições HTTP',
      'Uma versão do DOM que funciona sem JavaScript',
    ],
    correct: 1,
    feedbackOk:  '<strong>Correto!</strong> O Virtual DOM é uma representação em memória. O React faz "reconciliação" e aplica apenas as mudanças necessárias no DOM real.',
    feedbackNok: '<strong>Quase!</strong> O Virtual DOM é uma representação em memória do DOM real, permitindo que o React calcule o diff e aplique mudanças mínimas.',
  },
]

export const CODE_CHALLENGE: CodeChallenge = {
  statement: 'Crie uma função em JavaScript chamada <strong>somaArray</strong> que recebe um array de números e retorna a soma de todos os elementos.<br/><br/><strong>Exemplo:</strong> <code>somaArray([1, 2, 3])</code> deve retornar <code>6</code>',
  tests: [
    { input: [1, 2, 3],  expected: 6,  label: 'somaArray([1, 2, 3])  → 6'  },
    { input: [10, 20],   expected: 30, label: 'somaArray([10, 20])   → 30' },
    { input: [0],        expected: 0,  label: 'somaArray([0])        → 0'  },
  ],
}

export const CHALLENGES: Challenge[] = [
  { id: 1, title: 'Desafio Fundamentos Web',      desc: 'Frontend · Backend · Lógica', layout: 1, active: false  },
  { id: 2, title: 'Desafio JavaScript Avançado',  desc: 'Em breve',                   layout: 2, active: false },
  { id: 3, title: 'Desafio Full-Stack',            desc: 'Em breve',                   layout: 3, active: false },
]

export const RECS: Record<string, string[]> = {
  frontend: [
    'Aprofunde-se em semântica HTML5 e acessibilidade (ARIA)',
    'Estude CSS Flexbox e Grid Layout',
    'Explore o ciclo de vida de componentes React',
  ],
  backend: [
    'Leia sobre os princípios REST e verbos HTTP',
    'Pratique APIs com Node.js/Express',
    'Estude autenticação com JWT e OAuth',
  ],
  lógica: [
    'Resolva exercícios no LeetCode ou HackerRank',
    'Estude estruturas de dados (arrays, pilhas, filas)',
    'Revise coercions de tipo no JavaScript',
  ],
  geral: [
    'Consulte o MDN Web Docs para referências fundamentais',
    'Leia "Eloquent JavaScript" (gratuito online)',
    'Pratique pequenos projetos end-to-end',
  ],
}

export const SEED_RESULTS: StudentResult[] = []
export const DEFAULT_APPROVAL_THRESHOLD = 60 