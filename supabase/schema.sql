-- Desafio de Presença GT4.0 · tabelas novas.
-- Rode no SQL Editor do Supabase. As tabelas results, recovery_results e presenca_results já existem.

-- Cada tentativa do desafio (máximo 2 por aluno e formação, controlado no servidor).
create table if not exists public.desafio_tentativas (
  id bigserial primary key,
  email text not null,
  nome text not null default '',
  curso text not null,            -- fullstack | ia | fullcycle
  numero smallint not null,       -- 1 ou 2
  acertos integer not null,
  total integer not null,
  pct integer not null,
  aprovado boolean not null,
  ts timestamptz not null default now()
);
create index if not exists desafio_tentativas_email_curso
  on public.desafio_tentativas (email, curso);

-- Melhor resultado aprovado por aluno. Presença final = maior entre a atual e esta.
create table if not exists public.presenca_recuperada (
  email text primary key,
  nome text not null default '',
  curso text not null,
  pct integer not null,
  ts timestamptz not null default now()
);

-- Só o servidor (service_role) acessa estas tabelas. Sem políticas = anon/authenticated bloqueados.
alter table public.desafio_tentativas enable row level security;
alter table public.presenca_recuperada enable row level security;
