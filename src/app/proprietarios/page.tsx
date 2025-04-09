'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Proprietario } from '@/types/proprietario';
import { useAuth } from '@/contexts/AuthContext';
import AdminOnly from '@/components/AdminOnly';

export default function ProprietariosPage() {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();

  useEffect(() => {
    const fetchProprietarios = async () => {
      try {
        const response = await fetch('/api/proprietarios');
        if (!response.ok) {
          throw new Error('Falha ao buscar proprietários');
        }
        const data = await response.json();
        setProprietarios(data);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProprietarios();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este proprietário?')) {
      try {
        const response = await fetch(`/api/proprietarios/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Falha ao excluir proprietário');
        }

        setProprietarios(proprietarios.filter(prop => prop.id !== id));
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Proprietários</h1>
        <div className="flex space-x-2">
          <Link 
            href="/proprietarios/novo" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            Novo Proprietário
          </Link>
          <Link 
            href="/imoveis" 
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            Ver Imóveis
          </Link>
        </div>
      </div>

      {proprietarios.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-800 font-medium">Nenhum proprietário cadastrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-800">Nome</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-800">CPF</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-800">Telefone</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-800">Email</th>
                <th className="py-3 px-4 text-center font-semibold text-gray-800">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {proprietarios.map((proprietario) => (
                <tr key={proprietario.id} className="hover:bg-gray-50 text-gray-800">
                  <td className="py-3 px-4">{proprietario.nome}</td>
                  <td className="py-3 px-4">{proprietario.cpf}</td>
                  <td className="py-3 px-4">{proprietario.telefone}</td>
                  <td className="py-3 px-4">{proprietario.email}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-3">
                      <Link 
                        href={`/proprietarios/editar/${proprietario.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </Link>
                      <Link 
                        href={`/imoveis?proprietarioId=${proprietario.id}`}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Imóveis
                      </Link>
                      <AdminOnly>
                        <button
                          onClick={() => handleDelete(proprietario.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Excluir
                        </button>
                      </AdminOnly>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
