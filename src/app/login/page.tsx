'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrarLogin, setLembrarLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  
  // Carregar email salvo no localStorage quando o componente montar
  useEffect(() => {
    const emailSalvo = localStorage.getItem('lembrarLoginEmail');
    if (emailSalvo) {
      setEmail(emailSalvo);
      setLembrarLogin(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Salvar ou remover email do localStorage com base na opção "Lembrar login"
      if (lembrarLogin) {
        localStorage.setItem('lembrarLoginEmail', email);
      } else {
        localStorage.removeItem('lembrarLoginEmail');
      }
      
      await login(email, senha);
      router.push(redirect);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ocorreu um erro ao fazer login');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            Acesse sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sistema de gerenciamento de recibos
          </p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="senha" className="sr-only">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="lembrar-login"
              name="lembrar-login"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
              checked={lembrarLogin}
              onChange={(e) => setLembrarLogin(e.target.checked)}
            />
            <label htmlFor="lembrar-login" className="ml-2 block text-sm text-gray-400">
              Lembrar login
            </label>
          </div>

          {error && (
            <div className="bg-red-900 text-white px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
