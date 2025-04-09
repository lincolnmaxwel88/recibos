'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function TrocarSenhaPage() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { usuario, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  // Impedir navegação para outras páginas
  useEffect(() => {
    // Função para interceptar navegação
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!success && usuario?.trocarSenhaNoProximoLogin) {
        e.preventDefault();
        e.returnValue = 'Você precisa trocar sua senha antes de continuar.';
        return e.returnValue;
      }
    };

    // Adicionar listener para interceptar navegação
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Remover listener quando o componente for desmontado
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [success, usuario]);

  useEffect(() => {
    // Se não estiver carregando e o usuário não precisa trocar a senha, redirecionar para a página inicial
    if (!authLoading) {
      if (!usuario) {
        // Se não há usuário logado, redirecionar para a página de login
        router.push('/login');
      } else if (!usuario.trocarSenhaNoProximoLogin) {
        // Se o usuário não precisa trocar a senha, redirecionar para a página inicial
        router.push('/');
      }
    }
  }, [authLoading, usuario, router]);
  
  // Log para debug
  useEffect(() => {
    if (!authLoading && usuario) {
      console.log('Status trocarSenhaNoProximoLogin:', usuario.trocarSenhaNoProximoLogin);
    }
  }, [authLoading, usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações básicas
    if (!novaSenha || !confirmarSenha) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/usuarios/${usuario?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senha: novaSenha,
          trocarSenhaNoProximoLogin: false
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar senha');
      }

      setSuccess(true);
      
      // Aguardar 2 segundos e fazer logout para forçar novo login com a nova senha
      setTimeout(() => {
        logout();
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Carregando...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {usuario?.trocarSenhaNoProximoLogin && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p className="font-bold">Atenção!</p>
            <p>Você precisa trocar sua senha antes de continuar usando o sistema.</p>
          </div>
        )}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Troca de Senha Obrigatória</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Por questões de segurança, você precisa trocar sua senha antes de continuar.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
            <button
              className="absolute top-0 right-0 p-2"
              onClick={() => setError(null)}
            >
              <span className="text-red-500">&times;</span>
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            Senha alterada com sucesso! Você será redirecionado para fazer login novamente.
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nova Senha
              </label>
              <input
                id="novaSenha"
                name="novaSenha"
                type="password"
                autoComplete="new-password"
                required
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nova senha"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmar Nova Senha
              </label>
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                autoComplete="new-password"
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirmar nova senha"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading || success
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Alterando...' : success ? 'Senha Alterada' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
