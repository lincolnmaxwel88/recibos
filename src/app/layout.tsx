import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import PasswordChangeRequired from "@/components/PasswordChangeRequired";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Recibos",
  description: "Sistema de gerenciamento de recibos de aluguel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <AuthProvider>
          <PasswordChangeRequired>
            {/* Barra de navegação */}
            <Navbar />
            
            {/* Conteúdo principal */}
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </PasswordChangeRequired>
        </AuthProvider>
      </body>
    </html>
  );
}
