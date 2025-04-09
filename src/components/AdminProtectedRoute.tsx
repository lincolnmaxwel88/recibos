'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver carregando e o usuário não for admin, redirecionar para a página inicial
    if (!loading && usuario && !usuario.admin) {
      router.push('/');
    }
  }, [usuario, loading, router]);

  // Enquanto estiver carregando, mostrar um indicador de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Se o usuário não estiver autenticado ou não for admin, não renderizar nada
  // (o redirecionamento será feito pelo useEffect)
  if (!usuario || !usuario.admin) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
        <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  // Se o usuário for admin, renderizar o conteúdo
  return <>{children}</>;
}
