'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

function UsuariosContent() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { usuario: usuarioLogado } = useAuth();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/usuarios');
      
      if (!response.ok) {
        throw new Error('Falha ao carregar usuários');
      }
      
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleAtivarUsuario = async (id: string) => {
    try {
      const response = await fetch(`/api/usuarios/${id}/ativar`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao ativar usuário');
      }
      
      // Atualizar a lista de usuários
      fetchUsuarios();
    } catch (error) {
      console.error('Erro ao ativar usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro ao ativar usuário');
    }
  };

  const handleDesativarUsuario = async (id: string) => {
    try {
      const response = await fetch(`/api/usuarios/${id}/desativar`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao desativar usuário');
      }
      
      // Atualizar a lista de usuários
      fetchUsuarios();
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro ao desativar usuário');
    }
  };

  const handleExcluirUsuario = async (id: string) => {
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao excluir usuário');
      }
      
      // Atualizar a lista de usuários
      fetchUsuarios();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro ao excluir usuário');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <Link
          href="/usuarios/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Novo Usuário
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

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {usuarios.length > 0 ? (
              usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {usuario.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {usuario.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {!usuario.ativo ? (
                      <button
                        onClick={() => handleAtivarUsuario(usuario.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Ativar
                      </button>
                    ) : usuarioLogado?.id !== usuario.id ? (
                      <button
                        onClick={() => handleDesativarUsuario(usuario.id)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                      >
                        Desativar
                      </button>
                    ) : null}
                    
                    <Link
                      href={`/usuarios/editar/${usuario.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 ml-2"
                    >
                      Editar
                    </Link>
                    
                    {usuarioLogado?.id !== usuario.id && (
                      <button
                        onClick={() => handleExcluirUsuario(usuario.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-2"
                      >
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center"
                >
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function UsuariosPage() {
  return (
    <AdminProtectedRoute>
      <UsuariosContent />
    </AdminProtectedRoute>
  );
}
