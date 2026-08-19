"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth-screen" aria-labelledby="not-found-title">
      <section className="auth-panel" style={{ gridColumn: "1 / -1" }}>
        <div className="auth-panel-inner" style={{ margin: "0 auto" }}>
          <p className="auth-eyebrow">MuFinance</p>
          <h1 id="not-found-title">Página não encontrada.</h1>
          <p>O endereço que você acessou não existe ou foi movido.</p>
          <Link className="auth-submit" href="/">Voltar ao início</Link>
        </div>
      </section>
    </main>
  );
}
