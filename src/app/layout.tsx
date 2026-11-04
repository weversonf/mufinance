import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mufinance.online"),
  title: "MuFinance — Controle financeiro pessoal",
  description: "MuFinance — clareza para cuidar melhor do seu dinheiro.",
  openGraph: {
    title: "MuFinance — Controle financeiro pessoal",
    description: "MuFinance — clareza para cuidar melhor do seu dinheiro.",
    type: "website",
    url: "https://www.mufinance.online",
    images: [{ url: "/screenshots/shadcn-fintech.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MuFinance — Controle financeiro pessoal",
    description: "MuFinance — clareza para cuidar melhor do seu dinheiro.",
    images: ["/screenshots/shadcn-fintech.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MuFinance",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider><AuthProvider>{children}</AuthProvider></TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
