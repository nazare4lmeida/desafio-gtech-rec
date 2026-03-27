# DevDeskGame 🎮

Plataforma de desafios de programação para alunos — com 3 layouts visuais distintos, painel admin completo e fluxo de questões interativo.

---

## Stack

| Camada     | Tecnologia                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18 + TypeScript + Vite                    |
| Estilos    | Tailwind CSS v3                                 |
| Fontes     | Space Mono · DM Sans · Syne (Google Fonts)      |
| Backend    | Express 4 + TypeScript                          |
| Estado     | React Context API                               |
| Persistência | localStorage (pronto para migrar ao Supabase) |

---

## Estrutura do Projeto

```
devdeskgame/
├── package.json               # Script raiz com concurrently
├── client/                    # Frontend React
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx           # Entry point
│       ├── App.tsx            # Raiz: roteamento de telas
│       ├── index.css          # Tailwind base + CSS global
│       ├── types.ts           # Tipos TypeScript compartilhados
│       ├── data/
│       │   └── seed.ts        # Questões, desafio de código, recs
│       ├── hooks/
│       │   ├── useAppStore.tsx # Context + estado global
│       │   └── useToast.ts    # Hook de notificações
│       ├── utils/
│       │   ├── helpers.ts     # pct, initials, exportCSV, runCodeTests
│       │   └── api.ts         # Axios: chamadas à API Express
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── ProgressStrip.tsx
│       │   ├── DiffTag.tsx
│       │   ├── CodeEditor.tsx
│       │   ├── Toast.tsx
│       │   └── Modal.tsx
│       └── screens/
│           ├── LoginScreen.tsx
│           ├── SelectScreen.tsx
│           ├── ResultScreen.tsx
│           ├── challenge/
│           │   ├── index.tsx          # Roteador de layout
│           │   ├── QuestionL1.tsx     # Layout 1: card centralizado
│           │   ├── QuestionL2.tsx     # Layout 2: sidebar de progresso
│           │   ├── QuestionL3.tsx     # Layout 3: terminal/dark
│           │   └── CodeChallengeScreen.tsx
│           └── admin/
│               ├── index.tsx          # Shell com sidebar nav
│               ├── AdminDashboard.tsx
│               ├── AdminResults.tsx
│               ├── AdminQuestions.tsx
│               └── AdminOtherTabs.tsx # Code, Recs, Challenges, Config
└── server/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts           # Express app + rotas
        └── types.ts           # Tipos compartilhados do servidor
```

---

## Como Rodar

### 1. Instalar dependências

```bash
# Na raiz do projeto:
npm run install:all
```

Ou manualmente:
```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Variáveis de ambiente

```bash
# Copiar exemplos:
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Rodar em desenvolvimento

```bash
# Na raiz — sobe client (porta 5173) + server (porta 3001) juntos:
npm run dev
```

Ou separado:
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

### 4. Build de produção

```bash
cd client && npm run build
# Saída em client/dist/
```

---

## Acessos

| Perfil | Campo          | Valor                      |
|--------|----------------|----------------------------|
| Aluno  | Nome completo  | Qualquer (nome + sobrenome)|
|        | E-mail         | Qualquer e-mail válido     |

---

## Funcionalidades

### Fluxo do Aluno
- Login com nome completo + e-mail (sem senha)
- Seleção de desafio com 3 layouts visuais distintos:
  - **Layout 1** — card centralizado limpo
  - **Layout 2** — sidebar de progresso lateral
  - **Layout 3** — estética terminal/dark
- 5 questões (Principiante / Intermediário / Difícil)
- Feedback imediato por questão (correto/incorreto)
- Desafio de código com executor JavaScript no browser
- Bloqueio de Ctrl+C/V/X e clique direito no desafio de código
- Tela de resultado com nota, status, análise por categoria e recomendações
- Botão de compartilhar resultado (copia para clipboard)

### Painel Admin 
- **Dashboard** — métricas gerais e últimas submissões
- **Resultados** — tabela completa com filtros + exportação CSV
- **Editor de Questões** — edita enunciado, opções, correta, feedback, dificuldade, categoria
- **Editor de Código** — edita enunciado e casos de teste
- **Recomendações** — edita textos por categoria
- **Desafios** — ativa/desativa e renomeia desafios
- **Configurações** — critério de aprovação (%) + limpeza de dados

---

## Migração para Supabase

O estado atual usa `localStorage` para persistência. Para migrar:

1. Crie as tabelas no Supabase conforme o schema abaixo
2. Adicione `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` em `server/.env`
3. Substitua o array `results[]` em `server/src/index.ts` por chamadas ao cliente Supabase
4. Opcionalmente, use `@supabase/supabase-js` diretamente no client para autenticação real

### Schema sugerido

```sql
-- Usuários
create table users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  role text default 'student',
  created_at timestamptz default now()
);

-- Resultados
create table student_results (
  id bigint primary key generated always as identity,
  user_id uuid references users(id),
  score int not null,
  max_score int not null,
  passed boolean not null,
  answers jsonb,
  category_scores jsonb,
  completed_at timestamptz default now()
);

-- RLS: alunos só veem seus próprios resultados
alter table student_results enable row level security;
create policy "own results" on student_results
  for select using (auth.uid() = user_id);
```

---

## Licença

MIT — livre para uso educacional e comercial.
