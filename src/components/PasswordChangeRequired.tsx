'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface PasswordChangeRequiredProps {
  children: React.ReactNode;
}

/**
 * Componente que verifica se o usuário precisa trocar a senha.
 * Se precisar, redireciona para a página de troca de senha.
 * Caso contrário, renderiza o conteúdo normalmente.
 */
export default function PasswordChangeRequired({ children }: PasswordChangeRequiredProps) {
  const { usuario, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se não estiver carregando e o usuário precisa trocar a senha, redirecionar para a página de troca de senha
    // Mas apenas se não estiver já na página de troca de senha ou na página de login
    if (!loading && usuario?.trocarSenhaNoProximoLogin && 
        pathname !== '/trocar-senha' && 
        pathname !== '/login') {
      console.log('Redirecionando para /trocar-senha de:', pathname);
      router.push('/trocar-senha');
    }
  }, [loading, usuario, router, pathname]);

  // Se estiver carregando, mostrar uma mensagem de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Verificando credenciais...</p>
        </div>
      </div>
    );
  }

  // Se o usuário precisa trocar a senha e não está na página de troca de senha ou login, não renderizar o conteúdo
  if (usuario?.trocarSenhaNoProximoLogin && 
      pathname !== '/trocar-senha' && 
      pathname !== '/login') {
    return null;
  }

  // Se o usuário não precisa trocar a senha, renderizar o conteúdo normalmente
  return <>{children}</>;
}
