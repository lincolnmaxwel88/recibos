'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { Plano, PlanoId } from '@/types/plano';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  planoId: PlanoId;
}

function EditarUsuarioContent({ params }: { params: Promise<{ id: string }> }) {
  // Usar React.use() para desembrulhar o objeto params que agora é uma Promise
  const { id } = React.use(params);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [planoId, setPlanoId] = useState<PlanoId>('basico');
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { usuario: usuarioLogado } = useAuth();

  useEffect(() => {
    fetchUsuario();
    fetchPlanos();
  }, [id]);

  const fetchUsuario = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/usuarios/${id}`);
      
      if (!response.ok) {
        throw new Error('Falha ao carregar usuário');
      }
      
      const data = await response.json();
      setUsuario(data);
      setNome(data.nome);
      setEmail(data.email);
      setAtivo(data.ativo);
      setPlanoId(data.planoId || 'basico');
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      setError('Ocorreu um erro ao carregar o usuário. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPlanos = async () => {
    try {
      const response = await fetch('/api/planos');
      
      if (!response.ok) {
        throw new Error('Falha ao carregar planos');
      }
      
      const data = await response.json();
      setPlanos(data);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações básicas
    if (!nome || !email) {
      setError('Nome e email são obrigatórios');
      return;
    }

    if (senha && senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      setSaving(true);
      const updateData: any = {
        nome,
        email,
        ativo,
        planoId
      };

      // Só incluir a senha se ela foi preenchida
      if (senha) {
        updateData.senha = senha;
      }

      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar usuário');
      }

      // Redirecionar para a lista de usuários
      router.push('/usuarios');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setError(null);
      
      // Não permitir desativar o próprio usuário
      if (id === usuarioLogado?.id && ativo) {
        setError('Você não pode desativar seu próprio usuário.');
        return;
      }
      
      setSaving(true);
      const endpoint = ativo ? `/api/usuarios/${id}/desativar` : `/api/usuarios/${id}/ativar`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Erro ao ${ativo ? 'desativar' : 'ativar'} usuário`);
      }
      
      // Atualizar o estado
      setAtivo(!ativo);
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      setError(error instanceof Error ? error.message : `Erro ao ${ativo ? 'desativar' : 'ativar'} usuário`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        Usuário não encontrado
        <Link
          href="/usuarios"
          className="block mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Usuário</h1>
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
              Nova Senha (deixe em branco para manter a atual)
            </label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Nova senha"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmarSenha"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Confirmar nova senha"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <span className="mr-3 text-gray-700 dark:text-gray-300 text-sm font-bold">
                Status:
              </span>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  ativo
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {ativo ? 'Ativo' : 'Inativo'}
              </span>
              <button
                type="button"
                onClick={handleToggleStatus}
                className="ml-4 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                disabled={saving || (id === usuarioLogado?.id && ativo)}
              >
                {ativo ? 'Desativar' : 'Ativar'} Usuário
              </button>
            </div>
            {id === usuarioLogado?.id && ativo && (
              <p className="mt-1 text-xs text-red-500">
                Você não pode desativar seu próprio usuário.
              </p>
            )}
          </div>
          
          <div className="mb-6">
            <label
              htmlFor="planoId"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Plano
            </label>
            <select
              id="planoId"
              value={planoId}
              onChange={(e) => setPlanoId(e.target.value as PlanoId)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={saving}
            >
              {planos.map((plano) => (
                <option key={plano.id} value={plano.id}>
                  {plano.nome} - {plano.descricao}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Limites do Plano Selecionado</h3>
            {planos.find(p => p.id === planoId) && (
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><span className="font-medium">Imóveis:</span> {planos.find(p => p.id === planoId)?.limiteImoveis}</p>
                <p><span className="font-medium">Inquilinos:</span> {planos.find(p => p.id === planoId)?.limiteInquilinos}</p>
                <p><span className="font-medium">Proprietários:</span> {planos.find(p => p.id === planoId)?.limiteProprietarios}</p>
                <p><span className="font-medium">Relatórios Avançados:</span> {planos.find(p => p.id === planoId)?.permiteRelatoriosAvancados ? 'Sim' : 'Não'}</p>
                <p><span className="font-medium">Modelos Personalizados:</span> {planos.find(p => p.id === planoId)?.permiteModelosPersonalizados ? 'Sim' : 'Não'}</p>
                <p><span className="font-medium">Múltiplos Usuários:</span> {planos.find(p => p.id === planoId)?.permiteMultiplosUsuarios ? 'Sim' : 'Não'}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
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

export default function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AdminProtectedRoute>
      <EditarUsuarioContent params={params} />
    </AdminProtectedRoute>
  );
}
