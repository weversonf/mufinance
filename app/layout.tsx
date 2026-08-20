import type { Metadata } from "next";
import "../client/src/index.css";
import "../client/src/auth.css";
import "./globals.css";
import "../client/src/import.css";
import "../client/src/reports.css";
import "../client/src/categories.css";
import "../client/src/planning.css";
import "../client/src/saas-dashboard.css";
import { ClientProviders } from "../components/providers/ClientProviders";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mufinance.online"),
  title: {
    default: "MuFinance — sua vida financeira em um só lugar",
    template: "%s · MuFinance",
  },
  description: "Organize contas, cartões, metas e lançamentos em um espaço financeiro seguro e simples.",
  applicationName: "MuFinance",
  authors: [{ name: "MuFinance" }],
  keywords: ["finanças pessoais", "orçamento", "contas", "transações", "MuFinance"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.mufinance.online",
    siteName: "MuFinance",
    title: "MuFinance — sua vida financeira em um só lugar",
    description: "Organize e acompanhe seu dinheiro com clareza.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
