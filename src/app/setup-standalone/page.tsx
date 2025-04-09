'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db';
import { usuarios, planos } from '@/db/schema';

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
      // Criar plano básico
      const planoBasico = {
        id: 'basico',
        nome: 'Básico',
        descricao: 'Plano básico com recursos limitados',
        limiteImoveis: 5,
        limiteInquilinos: 5,
        limiteProprietarios: 5,
        permiteRelatoriosAvancados: false,
        permiteModelosPersonalizados: false,
        permiteMultiplosUsuarios: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Criar plano empresarial
      const planoEmpresarial = {
        id: 'empresarial',
        nome: 'Empresarial',
        descricao: 'Plano empresarial com recursos ilimitados',
        limiteImoveis: 100,
        limiteInquilinos: 100,
        limiteProprietarios: 100,
        permiteRelatoriosAvancados: true,
        permiteModelosPersonalizados: true,
        permiteMultiplosUsuarios: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Tentar inserir planos (ignorar erro se já existirem)
      try {
        await db.insert(planos).values(planoBasico);
        await db.insert(planos).values(planoEmpresarial);
      } catch (planoError) {
        console.log('Planos já existem ou erro ao inserir:', planoError);
        // Continuar mesmo se houver erro
      }
      
      // Criar senha com hash
      const senhaHash = await hash(senha, 10);
      
      // Criar usuário administrador
      const usuarioAdmin = {
        id: uuidv4(),
        nome: nome,
        email: email,
        senha: senhaHash,
        planoId: 'empresarial',
        ativo: true,
        admin: true,
        trocarSenhaNoProximoLogin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Tentar inserir usuário administrador
      try {
        await db.insert(usuarios).values(usuarioAdmin);
        
        setMessage('Administrador criado com sucesso! Redirecionando para o login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (userError) {
        console.error('Erro ao criar usuário:', userError);
        
        // Verificar se é um erro de usuário duplicado
        const errorMsg = String(userError);
        if (errorMsg.includes('UNIQUE constraint failed') && errorMsg.includes('email')) {
          setError('Este email já está em uso');
        } else {
          throw userError; // Lançar o erro para ser capturado pelo catch externo
        }
      }
    } catch (error) {
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
