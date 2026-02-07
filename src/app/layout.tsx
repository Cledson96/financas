import type { Metadata } from "next";
import { Providers } from "./providers";
import "../index.css";

export const metadata: Metadata = {
  title: "Family Finance - Controle Financeiro",
  description: "Aplicativo de gestão financeira para casais",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
