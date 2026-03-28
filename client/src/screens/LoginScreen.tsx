import { useState } from "react";
import { useApp } from "../hooks/useAppStore";
import { validateAdminAccess } from "../utils/api";

export default function LoginScreen() {
  const { login } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    adminCode?: string;
  }>({});
  const [course, setCourse] = useState<
    "fullstack" | "ia-generativa" | "ia-soft-skills"
  >("fullstack");
  const [adminCode, setAdminCode] = useState("");
  const isAdminEmail = email.trim().toLowerCase() === "nazyalmeida@gmail.com";

  const validate = () => {
    const e: typeof errors = {};

    if (!name.trim() || name.trim().split(" ").filter(Boolean).length < 2) {
      e.name = "Informe nome e sobrenome.";
    }

    if (!email.trim() || !email.includes("@")) {
      e.email = "Informe um e-mail válido.";
    }

    if (isAdminEmail && !adminCode.trim()) {
      e.adminCode = "Informe o código de acesso do admin.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const user = {
      name: name.trim(),
      email: email.trim(),
      course,
    };

    if (isAdminEmail) {
      try {
        const result = await validateAdminAccess({
          email: user.email,
          adminCode: adminCode.trim(),
        });

        if (!result.ok) {
          setErrors((prev) => ({
            ...prev,
            adminCode: "Código de acesso do admin inválido.",
          }));
          return;
        }

        login(user, true);
        return;
      } catch (error) {
        console.error("Erro ao validar acesso de admin:", error);
        setErrors((prev) => ({
          ...prev,
          adminCode: "Não foi possível validar o acesso de admin agora.",
        }));
        return;
      }
    }

    login(user, false);
  };

  return (
    <div className="w-full max-w-[460px] mt-4 animate-fade-up">
      {/* Brand strip — Space Mono + DM Sans (v1 style) */}
      <div className="bg-navy rounded-t-card px-10 py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-blue rounded-xl flex items-center justify-center text-lg">
            ⌨️
          </div>
          <span className="font-mono font-bold text-[1.4rem] text-white tracking-tight">
            Desafio<span className="text-sky">Gtech</span>Recupera
          </span>
        </div>
        <p className="text-[.82rem] text-white/50 font-sans">
          Plataforma de Desafios de Recuperação para Alunos da Geração Tech.
        </p>
      </div>

      {/* Form */}
      <div className="bg-surface rounded-b-card px-10 py-8 shadow-card-lg border border-border border-t-0">
        <div className="mb-5">
          <label className="block text-[.8rem] font-semibold text-slate mb-1.5 tracking-[.3px]">
            Nome Completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Ex: Maria Silva"
            autoComplete="name"
            className={`w-full px-3.5 py-3 border-[1.5px] rounded-xl text-[.9rem] font-sans bg-[#FAFCFF] text-text outline-none transition-all
              focus:border-blue focus:shadow-[0_0_0_3px_rgba(46,109,164,.14)]
              ${errors.name ? "border-red" : "border-border"}`}
          />
          {errors.name && (
            <p className="text-red text-[.76rem] mt-1">{errors.name}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-[.8rem] font-semibold text-slate mb-1.5 tracking-[.3px]">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Ex: maria@email.com"
            autoComplete="email"
            className={`w-full px-3.5 py-3 border-[1.5px] rounded-xl text-[.9rem] font-sans bg-[#FAFCFF] text-text outline-none transition-all
              focus:border-blue focus:shadow-[0_0_0_3px_rgba(46,109,164,.14)]
              ${errors.email ? "border-red" : "border-border"}`}
          />
          {errors.email && (
            <p className="text-red text-[.76rem] mt-1">{errors.email}</p>
          )}
        </div>

        {isAdminEmail && (
          <div className="mb-6">
            <label className="block text-[.8rem] font-semibold text-slate mb-1.5 tracking-[.3px]">
              Código de acesso do admin
            </label>
            <input
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
              placeholder="Informe o código do admin"
              className={`w-full px-3.5 py-3 border-[1.5px] rounded-xl text-[.9rem] font-sans bg-[#FAFCFF] text-text outline-none transition-all
        focus:border-blue focus:shadow-[0_0_0_3px_rgba(46,109,164,.14)]
        ${errors.adminCode ? "border-red" : "border-border"}`}
            />
            {errors.adminCode && (
              <p className="text-red text-[.76rem] mt-1">{errors.adminCode}</p>
            )}
          </div>
        )}
        <div className="mt-4">
          <label className="block text-sm font-semibold text-navy mb-2">
            Selecione seu curso
          </label>

          <select
            value={course}
            onChange={(e) =>
              setCourse(
                e.target.value as
                  | "fullstack"
                  | "ia-generativa"
                  | "ia-soft-skills",
              )
            }
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-navy outline-none focus:border-blue"
          >
            <option value="fullstack">Fullstack</option>
            <option value="ia-generativa">IA Generativa</option>
            <option value="ia-soft-skills">IA + Soft Skills</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-navy text-white font-semibold rounded-xl text-[.95rem] hover:bg-blue active:scale-[.98] transition-all"
        >
          Entrar →
        </button>

        <p className="text-center text-[.75rem] text-muted mt-3">
          Logue com seu nome e e-mail para acessar os desafios!
        </p>
      </div>
    </div>
  );
}
