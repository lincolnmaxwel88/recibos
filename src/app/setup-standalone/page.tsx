'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sql } from '@vercel/postgres';
// Nota: Não estamos mais usando o schema diretamente, pois estamos usando SQL bruto

export default function SetupStandalonePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const timestamp = new Date().toISOString();
      const userId = uuidv4();
      
      // Criar senha com hash
      const senhaHash = await hash(senha, 10);
      
      // Verificar se as tabelas existem
      try {
        // Inserir planos padrão (se não existirem)
        await sql`
          INSERT INTO "planos" ("id", "nome", "descricao", "limiteImoveis", "limiteInquilinos", "limiteProprietarios", "permiteRelatoriosAvancados", "permiteModelosPersonalizados", "permiteMultiplosUsuarios", "createdAt", "updatedAt")
          VALUES 
          ('basico', 'Básico', 'Plano básico com recursos limitados', 5, 5, 5, false, false, false, ${timestamp}, ${timestamp}),
          ('empresarial', 'Empresarial', 'Plano empresarial com recursos ilimitados', 100, 100, 100, true, true, true, ${timestamp}, ${timestamp})
          ON CONFLICT (id) DO NOTHING
        `;
        
        // Verificar se o email já existe
        const existingUser = await sql`SELECT email FROM "usuarios" WHERE email = ${email}`;
        
        if (existingUser && existingUser.rowCount && existingUser.rowCount > 0) {
          setError('Este email já está em uso');
          setLoading(false);
          return;
        }
        
        // Inserir usuário administrador
        await sql`
          INSERT INTO "usuarios" ("id", "nome", "email", "senha", "planoId", "ativo", "admin", "trocarSenhaNoProximoLogin", "createdAt", "updatedAt")
          VALUES (${userId}, ${nome}, ${email}, ${senhaHash}, 'empresarial', true, true, false, ${timestamp}, ${timestamp})
        `;
        
        setMessage('Administrador criado com sucesso! Redirecionando para o login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (dbError: any) {
        console.error('Erro ao configurar banco de dados:', dbError);
        
        // Verificar se é um erro de violação de unicidade
        if (dbError.message && dbError.message.includes('unique') && dbError.message.includes('email')) {
          setError('Este email já está em uso');
        } else if (dbError.message && dbError.message.includes('relation') && dbError.message.includes('does not exist')) {
          setError('Erro: As tabelas do banco de dados não foram criadas. Execute a migração primeiro.');
        } else {
          setError(`Erro ao configurar o banco de dados: ${dbError.message || 'Erro desconhecido'}`);
        }
      }
    } catch (error: any) {
      console.error('Erro ao criar administrador:', error);
      setError('Erro ao criar administrador: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">Configuração Inicial</h1>
        <p className="text-gray-600 mb-6 text-center">
          Crie um usuário administrador para acessar o sistema
        </p>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
      </div>
    </div>
  );
}
