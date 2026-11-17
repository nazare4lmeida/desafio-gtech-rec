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

// ---------- Guia de estudos (conceitos, analogias e exemplos dos assuntos dos desafios) ----------
export type SecaoGuia = { titulo: string; conceito: string; analogia: string; exemplo: string };
export type GuiaCurso = { titulo: string; intro: string; secoes: SecaoGuia[] };

export const GUIAS: Record<Curso, GuiaCurso> = {
  fullstack: {
    titulo: "Guia de Estudos · Full Stack",
    intro: "Aqui estão os assuntos da prova e dos desafios de código. Leia cada seção, rode o exemplo no seu editor e depois tente adaptá-lo.",
    secoes: [
      {
        titulo: "HTML: links e estrutura",
        conceito: "Tags HTML dizem o que é cada parte da página. A tag <a> cria um link, e o atributo href diz para onde ele leva.",
        analogia: "O HTML é o esqueleto de um livro: define capítulos, títulos e notas. O CSS é a diagramação, e o JavaScript é o que faz o livro reagir ao leitor.",
        exemplo: `<a href="https://gtech.com.br">Site do Geração Tech</a>`,
      },
      {
        titulo: "CSS: cores e fundo",
        conceito: "A propriedade color muda a cor do texto, e background-color muda o fundo. O seletor (como p ou .botao) escolhe quais elementos recebem o estilo.",
        analogia: "O CSS funciona como a maquiagem de um ator: não muda quem ele é, só a forma como aparece no palco.",
        exemplo: `p {
  color: #1e3a5f;
  background-color: #eef4fa;
}`,
      },
      {
        titulo: "JavaScript: tipos e comparações",
        conceito: "typeof informa o tipo de um valor. Ele tem uma peculiaridade: typeof null devolve \"object\", um erro antigo da linguagem. Para checar se algo é null, compare com === null.",
        analogia: "Uma caixa vazia continua sendo uma caixa. O typeof diz que é uma caixa, mas não diz se ela está vazia. Para saber, é preciso olhar dentro dela.",
        exemplo: `typeof 42      // "number"
typeof "oi"    // "string"
typeof null    // "object" (erro histórico)
null === null  // true`,
      },
      {
        titulo: "JavaScript: map, filter e reduce",
        conceito: "map transforma cada item de uma lista, filter escolhe só os itens que passam num teste, e reduce junta todos os itens em um único valor.",
        analogia: "Pense numa linha de montagem: o map pinta cada peça, o filter separa as peças boas, e o reduce empacota tudo numa única caixa.",
        exemplo: `const notas = [4, 7, 9, 3];
const aprovadas = notas.filter(n => n >= 6);                 // [7, 9]
const total = notas.reduce((soma, n) => soma + n, 0);         // 23`,
      },
      {
        titulo: "React: props e estado",
        conceito: "Props são dados que o componente pai passa ao filho, e o filho só lê. O estado (useState) guarda dados que mudam dentro do próprio componente.",
        analogia: "As props são o cardápio que o garçom entrega à mesa: a cozinha manda, o cliente só lê. O estado é o pedido que o cliente anota no próprio caderno e pode alterar.",
        exemplo: `function Saudacao({ nome }) {
  return <p>Olá, {nome}!</p>;
}

// uso: <Saudacao nome="Ana" />`,
      },
      {
        titulo: "Banco de dados: SELECT, FROM e WHERE",
        conceito: "SELECT escolhe as colunas, FROM indica a tabela e WHERE filtra as linhas que aparecem no resultado.",
        analogia: "Uma tabela é como uma planilha. O SELECT é pedir só as colunas que você precisa, e o WHERE é usar o filtro do Excel para mostrar só as linhas certas.",
        exemplo: `SELECT nome, email
FROM alunos
WHERE formacao = 'fullstack_online';`,
      },
      {
        titulo: "Desafio: texto (strings)",
        conceito: "Textos são sequências de letras. Você pode ler uma letra pela posição (começando em 0), pegar um trecho com slice e trocar a caixa com toUpperCase ou toLowerCase.",
        analogia: "Uma string é um trem de vagões, e cada letra é um vagão numerado a partir do zero. O slice separa um trecho do trem, e o toUpperCase pinta todos os vagões de maiúsculas.",
        exemplo: `const palavra = "gtech";
palavra[0];            // "g"
palavra.slice(1, 3);   // "te"
palavra.toUpperCase(); // "GTECH"`,
      },
      {
        titulo: "Desafio: laços e contadores",
        conceito: "Um for percorre uma lista item por item. Para contar, crie uma variável começando em 0 e some 1 sempre que um item atender à condição.",
        analogia: "É como contar carros numa estrada: você olha cada um, e a cada carro azul soma um no contador.",
        exemplo: `const carros = ["azul", "verde", "azul"];
let azuis = 0;
for (const carro of carros) {
  if (carro === "azul") azuis++;
}
// azuis vale 2`,
      },
    ],
  },

  "ia-generativa": {
    titulo: "Guia de Estudos · IA Generativa",
    intro: "Aqui estão os assuntos da prova e do desafio de prompt. O desafio avalia se o seu prompt tem papel, contexto, tarefa, formato e restrições.",
    secoes: [
      {
        titulo: "O que é um prompt",
        conceito: "Prompt é a mensagem que você envia ao modelo. É a única informação que a IA tem para saber o que fazer, por isso quanto mais clara a instrução, melhor a resposta.",
        analogia: "É como o pedido num restaurante. 'Qualquer coisa' gera um prato qualquer; 'risoto de cogumelos sem lactose, para duas pessoas' gera exatamente o que você quer.",
        exemplo: `Ruim: "Melhore meu currículo."
Bom: "Atue como um recrutador de tecnologia. Revise o currículo abaixo de um aluno iniciante e sugira 3 melhorias."`,
      },
      {
        titulo: "Papel: quem a IA é",
        conceito: "Começar com 'Atue como…' define o ponto de vista da resposta. Isso muda o tom, o vocabulário e o foco.",
        analogia: "É a diferença entre pedir opinião sobre um sintoma a um amigo ou a um médico. A pergunta é a mesma, mas o foco da resposta muda.",
        exemplo: `Atue como um recrutador de tecnologia com experiência em vagas de entrada.`,
      },
      {
        titulo: "Contexto: para quem e em que situação",
        conceito: "O contexto diz quem vai ler a resposta e em que situação ela será usada. Sem contexto, a IA responde de forma genérica.",
        analogia: "Um professor explica a mesma matéria de um jeito para uma criança e de outro para um adulto. O conteúdo é igual, mas a linguagem muda.",
        exemplo: `O candidato é iniciante, não tem experiência formal e quer entrar na área de dados.`,
      },
      {
        titulo: "Tarefa: verbo de ação",
        conceito: "Diga o que a IA deve fazer com um verbo claro: revise, corrija, compare, explique, sugira. Evite pedidos vagos como 'fale sobre'.",
        analogia: "O verbo é a ordem dada ao cozinheiro: pique, refogue, sirva. 'Cozinhe algo' deixa tudo em aberto.",
        exemplo: `Revise o texto e sugira uma melhoria para cada parágrafo.`,
      },
      {
        titulo: "Formato: como a resposta deve vir",
        conceito: "Peça a forma da resposta: lista, tabela, passo a passo, número de tópicos. Isso facilita a leitura e a conferência.",
        analogia: "É como pedir um relatório no modelo padrão da empresa: quem recebe consegue ler do mesmo jeito todas as vezes.",
        exemplo: `Responda em 3 tópicos, cada um com uma frase curta.`,
      },
      {
        titulo: "Restrições: limites e o que evitar",
        conceito: "Restrições dizem o que não fazer e até onde ir: tamanho, linguagem e o que evitar. Elas reduzem respostas longas e invenções.",
        analogia: "É a regra de uma receita, como 'sem glúten' ou 'no máximo 30 minutos'. Sem regra, o prato pode sair de qualquer jeito.",
        exemplo: `Não invente experiências. Limite a resposta a 200 palavras.`,
      },
      {
        titulo: "Alucinações: quando conferir",
        conceito: "Modelos podem inventar fatos com muita confiança. Confira datas, números, nomes e links antes de usar a resposta.",
        analogia: "A IA é como um colega muito seguro que às vezes chuta. Você pode confiar, mas confere antes de assinar.",
        exemplo: `Liste as informações que precisam ser conferidas em fontes oficiais.`,
      },
      {
        titulo: "Raciocínio passo a passo",
        conceito: "Pedir o raciocínio em etapas ajuda em problemas de lógica e de cálculo, porque fica fácil ver onde a conta saiu do esperado.",
        analogia: "É como pedir a conta escrita, e não só o resultado final: dá para ver em que passo errou.",
        exemplo: `Resolva em etapas numeradas e mostre o resultado no fim.`,
      },
    ],
  },

  fullcycle: {
    titulo: "Guia de Estudos · FullCycle",
    intro: "Aqui estão os assuntos da prova e dos desafios de código. Use os exemplos para testar no seu terminal ou editor.",
    secoes: [
      {
        titulo: "Git: branches",
        conceito: "Um branch é uma linha de trabalho separada. git checkout -b cria um branch novo e já muda para ele (git switch -c faz o mesmo). git merge junta o trabalho de um branch em outro.",
        analogia: "Um branch é um rascunho do projeto: você testa ideias sem mexer no texto original, e só junta o rascunho quando ele estiver pronto.",
        exemplo: `git checkout -b feature/login
# faça as alterações
git add .
git commit -m "adiciona login"
git checkout main
git merge feature/login`,
      },
      {
        titulo: "Docker: imagem e container",
        conceito: "Uma imagem é um modelo somente leitura, com tudo o que a aplicação precisa. Um container é uma instância em execução criada a partir dela.",
        analogia: "A imagem é a forma de bolo e o container é cada bolo assado. Dá para assar vários bolos da mesma forma, e um não estraga o outro.",
        exemplo: `docker build -t minha-api .
docker run -p 3000:3000 minha-api`,
      },
      {
        titulo: "APIs REST: métodos HTTP",
        conceito: "GET lê um recurso, POST cria, PUT substitui o recurso por completo, PATCH altera só parte dele e DELETE remove.",
        analogia: "Pense numa ficha de cadastro: GET é consultar a ficha, POST é abrir uma ficha nova, PUT é reescrever a ficha inteira, PATCH é corrigir um campo e DELETE é arquivar a ficha.",
        exemplo: `GET    /alunos/10   -> lê o aluno 10
POST   /alunos      -> cria um aluno
PUT    /alunos/10   -> substitui os dados do aluno 10
PATCH  /alunos/10   -> altera só o e-mail do aluno 10`,
      },
      {
        titulo: "Códigos de status HTTP",
        conceito: "2xx indica sucesso (200 OK, 201 Created). 4xx indica erro de quem fez a requisição (400, 401, 404). 5xx indica erro do servidor (500).",
        analogia: "É como um semáforo: o verde (2xx) segue; o erro de quem dirige (4xx) é um problema do pedido; o erro da própria rua (5xx) é um problema de quem atende.",
        exemplo: `res.status(201).json({ id: 10 });                 // criado
res.status(404).json({ erro: "não encontrado" }); // não existe`,
      },
      {
        titulo: "Testes unitários",
        conceito: "Um teste unitário verifica uma unidade isolada, como uma função, com entradas conhecidas e um resultado esperado.",
        analogia: "É como provar um ingrediente antes de montar o prato: se o açúcar estiver bom, o bolo tem mais chance de dar certo.",
        exemplo: `function dobro(n) {
  return n * 2;
}
// teste: dobro(3) deve ser 6`,
      },
      {
        titulo: "Desafio: agrupar e paginar listas",
        conceito: "Para agrupar, use um objeto como dicionário: a chave é o grupo e o valor é uma lista. Para paginar, use slice dentro de um laço que avança de tamanho em tamanho.",
        analogia: "Agrupar é separar cartas por naipe. Paginar é dividir o baralho em montes de tamanho fixo, sendo que o último monte pode ser menor.",
        exemplo: `const grupos = {};
for (const item of itens) {
  if (!grupos[item.tipo]) grupos[item.tipo] = [];
  grupos[item.tipo].push(item.nome);
}

const paginas = [];
for (let i = 0; i < lista.length; i += tamanho) {
  paginas.push(lista.slice(i, i + tamanho));
}`,
      },
      {
        titulo: "Desafio: sequências e porcentagens",
        conceito: "Para achar a maior sequência, mantenha um contador que zera quando a condição falha e guarde o maior valor já visto. Para porcentagem, divida as partes pelo total, multiplique por 100 e arredonde com Math.round.",
        analogia: "A sequência de dias seguidos é como um contador de bolinhas que zera a cada falta. A porcentagem é a fatia da pizza que você já comeu.",
        exemplo: `Math.round((2 / 5) * 100); // 40
// contador de sequência: zera em false, guarda o maior valor`,
      },
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
