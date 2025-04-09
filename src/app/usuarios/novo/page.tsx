'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

function NovoUsuarioContent() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [admin, setAdmin] = useState(false);
  const [trocarSenhaNoProximoLogin, setTrocarSenhaNoProximoLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações básicas
    if (!nome || !email || !senha) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          admin,
          trocarSenhaNoProximoLogin,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      // Redirecionar para a lista de usuários
      router.push('/usuarios');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Novo Usuário</h1>
        <Link
          href="/usuarios"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Voltar para a lista
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
          <button
            className="absolute top-0 right-0 p-2"
            onClick={() => setError(null)}
          >
            <span className="text-red-500">&times;</span>
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="nome"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Nome
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="senha"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Senha
            </label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Senha"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmarSenha"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Confirmar Senha
            </label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Confirmar senha"
              required
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="admin"
                type="checkbox"
                checked={admin}
                onChange={(e) => setAdmin(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="admin" className="ml-2 block text-gray-700 dark:text-gray-300 text-sm font-bold">
                Usuário Administrador
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Administradores têm acesso a funcionalidades adicionais, como o gerenciamento de usuários.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="trocarSenha"
                type="checkbox"
                checked={trocarSenhaNoProximoLogin}
                onChange={(e) => setTrocarSenhaNoProximoLogin(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="trocarSenha" className="ml-2 block text-gray-700 dark:text-gray-300 text-sm font-bold">
                Forçar troca de senha no próximo login
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Se marcada, o usuário será obrigado a trocar a senha na próxima vez que fizer login no sistema.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <Link
              href="/usuarios"
              className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NovoUsuarioPage() {
  return (
    <AdminProtectedRoute>
      <NovoUsuarioContent />
    </AdminProtectedRoute>
  );
}
