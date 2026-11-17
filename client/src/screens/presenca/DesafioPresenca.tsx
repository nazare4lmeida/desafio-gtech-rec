import { useEffect, useState } from "react";
import { useApp } from "../../hooks/useAppStore";
import {
  DesafioAluno,
  DesafioResultado,
  DesafioStatus,
  enviarDesafio,
  fetchDesafio,
  fetchDesafioStatus,
} from "../../utils/api";

// Desafio de Presença: prova (5 questões) + desafio prático. Até 2 tentativas.
// A nota é a soma dos acertos. 75% ou mais recupera a presença.
export default function DesafioPresenca() {
  const { state, navigate } = useApp();
  const user = state.user;

  const [desafio, setDesafio] = useState<DesafioAluno | null>(null);
  const [status, setStatus] = useState<DesafioStatus | null>(null);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [codigos, setCodigos] = useState<Record<string, string>>({});
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<DesafioResultado | null>(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const credenciais = {
    email: user?.email ?? "",
    dataNascimento: user?.dataNascimento ?? "",
    curso: user?.course ?? "",
  };

  useEffect(() => {
    if (!user?.dataNascimento) return;
    fetchDesafio(user.course)
      .then((d) => {
        setDesafio(d);
        setRespostas(new Array(d.prova.length).fill(-1));
        const iniciais: Record<string, string> = {};
        d.questoes?.forEach((q) => (iniciais[q.id] = q.inicial));
        setCodigos(iniciais);
      })
      .catch(() => setErro("Não foi possível carregar o desafio agora."));
    fetchDesafioStatus(credenciais)
      .then(setStatus)
      .catch(() => setErro("Não foi possível consultar suas tentativas."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.course, user?.email]);

  if (!user?.dataNascimento) {
    return (
      <div className="w-full max-w-[520px] mx-auto text-center">
        <p className="text-navy mb-4">Entre de novo para confirmar seus dados.</p>
        <button onClick={() => navigate("select")} className="px-5 py-2 bg-navy text-white rounded-xl">
          Voltar
        </button>
      </div>
    );
  }

  const bloqueado = status?.aprovado || (status !== null && status.restantes === 0);
  const provaCompleta = respostas.length > 0 && respostas.every((r) => r >= 0);
  const desafioPreenchido =
    desafio?.tipo === "codigo"
      ? Object.values(codigos).some((c) => c.trim() !== "")
      : texto.trim().length >= (desafio?.minimoCaracteres ?? 0);

  const enviar = async () => {
    if (!desafio) return;
    setErro("");
    setEnviando(true);
    try {
      const r = await enviarDesafio({
        ...credenciais,
        respostas,
        ...(desafio.tipo === "codigo" ? { codigos } : { texto }),
      });
      setResultado(r);
      setStatus(await fetchDesafioStatus(credenciais));
    } catch (e: any) {
      const bruto = e?.response?.data?.error;
      setErro(typeof bruto === "string" && bruto ? bruto : "Não foi possível enviar agora.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full max-w-[720px] mx-auto animate-fade-up">
      <div className="bg-navy rounded-t-card px-8 py-6 text-white">
        <p className="text-xs text-white/60">Desafio de Presença</p>
        <h1 className="font-mono text-xl font-bold">{desafio?.titulo ?? "Carregando…"}</h1>
        {desafio && (
          <p className="text-sm text-white/70 mt-1">
            Nível {desafio.nivel} · precisa de {desafio.notaMinima}% · até {desafio.limite} tentativas
          </p>
        )}
      </div>

      <div className="bg-surface rounded-b-card px-8 py-6 border border-border border-t-0 space-y-6">
        {status && !resultado && (
          <p className="text-sm text-slate">
            {status.aprovado
              ? `Presença recuperada com ${status.melhorPct}%.`
              : `Tentativas restantes: ${status.restantes}.`}
          </p>
        )}

        {desafio && !resultado && !bloqueado && (
          <>
            <section className="space-y-4">
              <h2 className="font-semibold text-navy">1. Prova</h2>
              {desafio.prova.map((q, i) => (
                <div key={q.id} className="space-y-2">
                  <p className="text-sm text-navy">
                    {i + 1}. {q.pergunta}
                  </p>
                  <div className="grid gap-2">
                    {q.opcoes.map((op, j) => (
                      <label
                        key={j}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm
                          ${respostas[i] === j ? "border-blue bg-[#E0EDF8]" : "border-border"}`}
                      >
                        <input
                          type="radio"
                          name={`prova-${q.id}`}
                          checked={respostas[i] === j}
                          onChange={() => setRespostas(respostas.map((r, k) => (k === i ? j : r)))}
                        />
                        {op}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <section className="space-y-4">
              <h2 className="font-semibold text-navy">2. Desafio</h2>
              <p className="text-sm text-navy">{desafio.enunciado}</p>

              {desafio.tipo === "codigo" &&
                desafio.questoes?.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <h3 className="font-semibold text-navy text-sm">{q.titulo}</h3>
                    <p className="text-sm text-slate">{q.descricao}</p>
                    <textarea
                      value={codigos[q.id] ?? ""}
                      onChange={(e) => setCodigos({ ...codigos, [q.id]: e.target.value })}
                      spellCheck={false}
                      rows={6}
                      className="w-full font-mono text-sm rounded-xl border border-border bg-[#0F1B2D] text-[#E6F0FA] p-3 outline-none focus:border-blue"
                    />
                  </div>
                ))}

              {desafio.tipo === "prompt" && (
                <>
                  <ul className="text-sm text-slate list-disc pl-5 space-y-1">
                    {desafio.criterios?.map((c) => (
                      <li key={c.id}>{c.rotulo}</li>
                    ))}
                  </ul>
                  <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    rows={8}
                    placeholder="Escreva seu prompt aqui"
                    className="w-full text-sm rounded-xl border border-border p-3 outline-none focus:border-blue"
                  />
                  <p className="text-xs text-muted">
                    {texto.trim().length} / {desafio.minimoCaracteres} caracteres
                  </p>
                </>
              )}
            </section>

            {erro && <p className="text-sm text-red">{erro}</p>}

            <button
              onClick={enviar}
              disabled={enviando || !provaCompleta || !desafioPreenchido}
              className="w-full py-3 bg-navy text-white font-semibold rounded-xl hover:bg-blue disabled:opacity-50"
            >
              {enviando ? "Corrigindo…" : "Enviar prova e desafio"}
            </button>
          </>
        )}

        {resultado && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="font-mono text-3xl font-bold text-navy">{resultado.pct}%</p>
              <p className="text-sm text-slate">
                Prova: {resultado.prova.acertos} de {resultado.prova.total} · Desafio: {resultado.desafio.acertos} de{" "}
                {resultado.desafio.total}
              </p>
              {resultado.motivo && <p className="text-sm text-red">{resultado.motivo}</p>}
              <p className={`font-semibold ${resultado.aprovado ? "text-green" : "text-red"}`}>
                {resultado.aprovado
                  ? "Aprovado! Sua presença foi recuperada."
                  : resultado.restantes > 0
                    ? `Não atingiu ${desafio?.notaMinima}%. Você ainda tem ${resultado.restantes} tentativa.`
                    : `Não atingiu ${desafio?.notaMinima}%. Suas tentativas acabaram.`}
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="font-semibold text-navy">Correção da prova</h2>
              {resultado.feedback.prova.map((d, i) => (
                <div key={i} className={`rounded-xl border p-3 text-sm ${d.acertou ? "border-green-bdr bg-green-bg" : "border-red/40 bg-red/5"}`}>
                  <p className="font-semibold text-navy">
                    {i + 1}. {d.pergunta} <span className={d.acertou ? "text-green" : "text-red"}>{d.acertou ? "✓" : "✗"}</span>
                  </p>
                  {!d.acertou && (
                    <p className="text-slate mt-1">
                      Você marcou: {d.marcada >= 0 ? d.opcoes[d.marcada] : "nenhuma"}. Resposta correta: {d.opcoes[d.correta]}.
                    </p>
                  )}
                  <p className="text-slate mt-1">{d.explicacao}</p>
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <h2 className="font-semibold text-navy">Correção do desafio</h2>
              {resultado.feedback.desafio.tipo === "codigo" &&
                resultado.feedback.desafio.questoes.map((q) => (
                  <div key={q.titulo} className="space-y-1">
                    <h3 className="text-sm font-semibold text-navy">{q.titulo}</h3>
                    {q.testes.map((t, j) => (
                      <p key={t.id} className={`text-sm ${t.passou ? "text-green" : "text-red"}`}>
                        {t.passou ? "✓" : "✗"} Teste {j + 1}: entrada {t.args.map((a) => JSON.stringify(a)).join(", ")}
                      </p>
                    ))}
                  </div>
                ))}

              {resultado.feedback.desafio.tipo === "prompt" && (
                <ul className="space-y-1 text-sm">
                  {resultado.feedback.desafio.criterios.map((c) => (
                    <li key={c.rotulo} className={c.atendeu ? "text-green" : "text-red"}>
                      {c.atendeu ? "✓" : "✗"} {c.rotulo}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {bloqueado && !resultado && (
          <p className="text-sm text-slate text-center">
            {status?.aprovado
              ? "Você já recuperou sua presença nesta formação."
              : "Você já usou as suas tentativas nesta formação. Procure a coordenação."}
          </p>
        )}

        <button onClick={() => navigate("select")} className="w-full py-2 text-sm text-slate hover:text-navy">
          Voltar
        </button>
      </div>
    </div>
  );
}
