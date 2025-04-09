'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function TrocarSenhaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Cabeçalho simplificado sem navegação */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Sistema de Recibos</h1>
            </div>
            {!loading && usuario && (
              <div className="text-sm">
                <span>Olá, {usuario.nome}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
