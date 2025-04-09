'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { Plano } from '@/types/plano';

function GerenciamentoPlanosContent() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const { usuario } = useAuth();

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/planos');
      
      if (!response.ok) {
        throw new Error('Falha ao carregar planos');
      }
      
      const data = await response.json();
      setPlanos(data);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      setError('Ocorreu um erro ao carregar os planos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (planoId: string, field: keyof Plano, value: any) => {
    setPlanos(prevPlanos => 
      prevPlanos.map(plano => 
        plano.id === planoId 
          ? { ...plano, [field]: field.startsWith('permite') ? Boolean(value) : field.startsWith('limite') ? Number(value) : value } 
          : plano
      )
    );
  };

  const handleSubmit = async (planoId: string) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const plano = planos.find(p => p.id === planoId);
      if (!plano) {
        throw new Error('Plano não encontrado');
      }
      
      const response = await fetch(`/api/planos/${planoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plano),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar plano');
      }
      
      setSuccessMessage(`Plano ${plano.nome} atualizado com sucesso!`);
      
      // Recarregar os planos após a atualização
      fetchPlanos();
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar plano');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Planos</h1>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Voltar para o Dashboard
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
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {successMessage}
          <button
            className="absolute top-0 right-0 p-2"
            onClick={() => setSuccessMessage(null)}
          >
            <span className="text-green-500">&times;</span>
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planos.map((plano) => (
          <div key={plano.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">{plano.nome}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{plano.descricao}</p>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(plano.id); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Nome do Plano
                  </label>
                  <input
                    type="text"
                    value={plano.nome}
                    onChange={(e) => handleInputChange(plano.id, 'nome', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={plano.descricao}
                    onChange={(e) => handleInputChange(plano.id, 'descricao', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={2}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Limite de Proprietários
                  </label>
                  <input
                    type="number"
                    value={plano.limiteProprietarios}
                    onChange={(e) => handleInputChange(plano.id, 'limiteProprietarios', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Limite de Imóveis
                  </label>
                  <input
                    type="number"
                    value={plano.limiteImoveis}
                    onChange={(e) => handleInputChange(plano.id, 'limiteImoveis', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Limite de Inquilinos
                  </label>
                  <input
                    type="number"
                    value={plano.limiteInquilinos}
                    onChange={(e) => handleInputChange(plano.id, 'limiteInquilinos', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="1"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`relatorios-${plano.id}`}
                    checked={plano.permiteRelatoriosAvancados}
                    onChange={(e) => handleInputChange(plano.id, 'permiteRelatoriosAvancados', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`relatorios-${plano.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Permite Relatórios Avançados
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`modelos-${plano.id}`}
                    checked={plano.permiteModelosPersonalizados}
                    onChange={(e) => handleInputChange(plano.id, 'permiteModelosPersonalizados', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`modelos-${plano.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Permite Modelos Personalizados
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`usuarios-${plano.id}`}
                    checked={plano.permiteMultiplosUsuarios}
                    onChange={(e) => handleInputChange(plano.id, 'permiteMultiplosUsuarios', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`usuarios-${plano.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Permite Múltiplos Usuários
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GerenciamentoPlanosPage() {
  return (
    <AdminProtectedRoute>
      <GerenciamentoPlanosContent />
    </AdminProtectedRoute>
  );
}
