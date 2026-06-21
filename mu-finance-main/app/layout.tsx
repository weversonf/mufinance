import './globals.css';
import { AuthProvider } from './auth-context';
import { ThemeProvider } from './theme-context';

export const metadata = {
  title: 'Mucuripe Finance',
  description: 'Controle Financeiro Pessoal',
  manifest: '/manifest.json',
  themeColor: '#020617',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Removi a classe "dark" fixa para o ThemeProvider poder controlar o tema
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/3135/3135706.png" />
      </head>
      {/* Ajustei o body para ter um fundo que reage ao tema e preenche a tela toda */}
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            {/* O container 'main' centraliza o conteúdo em 80% no PC,
                mas o 'body' acima garante que o fundo colorido vá até as bordas da tela.
            */}
            <main className="mx-auto w-full md:w-[85%] lg:w-[80%] max-w-7xl min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
