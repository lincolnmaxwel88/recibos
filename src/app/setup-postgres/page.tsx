'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SetupPostgresPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    // Verificar a conexão com o banco de dados ao carregar a página
    async function checkConnection() {
      try {
        const response = await fetch('/api/db/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (data.connected) {
          setDbStatus('connected');
        } else {
          setDbStatus('error');
          setError('Não foi possível conectar ao banco de dados. Verifique se o Postgres está configurado na Vercel.');
        }
      } catch (error) {
        console.error('Erro ao verificar conexão:', error);
        setDbStatus('error');
        setError('Erro ao verificar a conexão com o banco de dados.');
      }
    }
    
    checkConnection();
  }, []);

  const handleMigrate = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await fetch('/api/db/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Migração concluída com sucesso! Agora você pode criar um usuário administrador.');
      } else {
        setError(`Erro ao executar migração: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao executar migração:', error);
      setError('Erro ao executar migração do banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/db/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha, nome }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || 'Erro ao criar administrador');
      }

      const data = await response.json();
      
      setMessage('Administrador criado com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      console.error('Erro ao criar administrador:', error);
      setError('Erro ao criar administrador: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">Configuração do Postgres</h1>
        
        {dbStatus === 'checking' && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded text-center">
            Verificando conexão com o banco de dados...
          </div>
        )}
        
        {dbStatus === 'connected' && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center">
            Conectado ao banco de dados PostgreSQL!
          </div>
        )}
        
        {dbStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            <p className="font-bold">Erro de conexão:</p>
            <p>{error}</p>
            <p className="mt-2">
              Certifique-se de que você adicionou o Postgres à sua aplicação na Vercel:
            </p>
            <ol className="list-decimal ml-5 mt-2">
              <li>Vá para o painel da Vercel</li>
              <li>Selecione seu projeto</li>
              <li>Vá para "Storage"</li>
              <li>Adicione o Postgres</li>
            </ol>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}

        {error && !error.includes('conexão') && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {dbStatus === 'connected' && (
          <>
            <div className="mb-6">
              <button
                onClick={handleMigrate}
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                  loading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {loading ? 'Executando...' : 'Executar Migração do Banco de Dados'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Este passo criará todas as tabelas necessárias no banco de dados PostgreSQL.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Criar Administrador</h2>
              
              <div className="mb-4">
                <label htmlFor="nome" className="block text-gray-700 font-medium mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="senha" className="block text-gray-700 font-medium mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  id="senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sua senha"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                  loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Criando...' : 'Criar Administrador'}
              </button>
            </form>
          </>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/" className="text-blue-600 hover:underline">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
