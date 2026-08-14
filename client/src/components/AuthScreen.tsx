import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function firebaseErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "E-mail ou senha inválidos.";
  if (code.includes("email-already-in-use")) return "Este e-mail já possui uma conta.";
  if (code.includes("weak-password")) return "Use uma senha com pelo menos 6 caracteres.";
  if (code.includes("invalid-email")) return "Digite um e-mail válido.";
  if (code.includes("too-many-requests")) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (code.includes("operation-not-allowed")) return "O login por e-mail ainda não foi ativado no Firebase.";
  if (code.includes("permission-denied") || code.includes("failed-precondition")) return "O Firestore ainda precisa ser habilitado ou configurado no projeto Firebase.";
  return "Não foi possível concluir a operação. Confira o Firebase e tente novamente.";
}

export default function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setFeedback({ type: "error", message: "Preencha e-mail e senha para continuar." });
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setFeedback({ type: "error", message: "Use uma senha com pelo menos 6 caracteres." });
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") await signIn(normalizedEmail, password);
      else await signUp(normalizedEmail, password);
    } catch (error) {
      setFeedback({ type: "error", message: firebaseErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setFeedback({ type: "error", message: "Digite seu e-mail para receber o link de recuperação." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await resetPassword(normalizedEmail);
      setFeedback({ type: "success", message: "Link de recuperação enviado. Confira sua caixa de entrada." });
    } catch (error) {
      setFeedback({ type: "error", message: firebaseErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-showcase" aria-label="Sobre o MuFinance">
        <div className="auth-brand"><span className="auth-brand-mark">M</span><span>mufinance</span></div>
        <div className="auth-showcase-copy">
          <p className="auth-eyebrow"><Sparkles size={14} /> sua carteira em um só lugar</p>
          <h1>Mais clareza para cada decisão financeira.</h1>
          <p>Organize contas, cartões, metas e lançamentos em um espaço seguro, simples e feito para acompanhar sua vida real.</p>
        </div>
        <div className="auth-trust-card"><ShieldCheck size={18} /><span>Seus dados ficam vinculados somente à sua conta.</span></div>
      </section>

      <section className="auth-panel" aria-label={mode === "login" ? "Entrar" : "Criar conta"}>
        <div className="auth-panel-inner">
          <div className="auth-panel-heading">
            <p className="auth-eyebrow">Bem-vindo de volta</p>
            <h2>{mode === "login" ? "Entre no seu espaço." : "Crie seu espaço."}</h2>
            <p>{mode === "login" ? "Acesse seus dados financeiros com segurança." : "Comece com uma conta gratuita no MuFinance."}</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <label className="auth-field">
              <span>E-mail</span>
              <span className="auth-input-wrap"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" /></span>
            </label>
            <label className="auth-field">
              <span>Senha</span>
              <span className="auth-input-wrap"><LockKeyhole size={17} /><input type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" /><button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
            </label>

            {feedback && <p className={`auth-feedback auth-feedback--${feedback.type}`} role="alert">{feedback.message}</p>}

            <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}<ArrowRight size={17} /></button>
          </form>

          {mode === "login" && <button className="auth-link auth-reset" type="button" onClick={handleResetPassword} disabled={busy}>Esqueci minha senha</button>}
          <div className="auth-divider"><span>ou</span></div>
          <p className="auth-switch">{mode === "login" ? "Ainda não tem uma conta?" : "Já tem uma conta?"} <button type="button" className="auth-link" onClick={() => { setMode((value) => value === "login" ? "signup" : "login"); setFeedback(null); }}>{mode === "login" ? "Criar conta" : "Entrar"}</button></p>
          <p className="auth-legal">Ao continuar, você concorda com o uso do MuFinance para organizar seus dados financeiros pessoais.</p>
        </div>
      </section>
    </main>
  );
}
