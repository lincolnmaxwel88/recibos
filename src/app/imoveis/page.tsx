'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Imovel } from '@/types/imovel';
import { Proprietario } from '@/types/proprietario';
import { useAuth } from '@/contexts/AuthContext';
import AdminOnly from '@/components/AdminOnly';

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [proprietarios, setProprietarios] = useState<Record<string, Proprietario>>({});
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar se há um filtro de proprietário na URL
        const urlParams = new URLSearchParams(window.location.search);
        const proprietarioId = urlParams.get('proprietarioId');
        
        // Buscar imóveis (filtrados por proprietário se o parâmetro estiver presente)
        const imoveisUrl = proprietarioId 
          ? `/api/imoveis?proprietarioId=${proprietarioId}`
          : '/api/imoveis';
          
        const imoveisResponse = await fetch(imoveisUrl);
        if (!imoveisResponse.ok) {
          throw new Error('Falha ao buscar imóveis');
        }
        const imoveisData = await imoveisResponse.json();
        
        // Buscar proprietários
        const proprietariosResponse = await fetch('/api/proprietarios');
        if (!proprietariosResponse.ok) {
          throw new Error('Falha ao buscar proprietários');
        }
        const proprietariosData = await proprietariosResponse.json();
        
        // Criar um mapa de proprietários para fácil acesso
        const proprietariosMap: Record<string, Proprietario> = {};
        proprietariosData.forEach((prop: Proprietario) => {
          proprietariosMap[prop.id] = prop;
        });
        
        setImoveis(imoveisData);
        setProprietarios(proprietariosMap);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      try {
        const response = await fetch(`/api/imoveis/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Falha ao excluir imóvel');
        }

        setImoveis(imoveis.filter(imovel => imovel.id !== id));
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      'casa': 'Casa',
      'apartamento': 'Apartamento',
      'terreno': 'Terreno',
      'comercial': 'Comercial',
      'outro': 'Outro'
    };
    return tipos[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Imóveis</h1>
          {(() => {
            // Verificar se há um filtro de proprietário na URL
            const urlParams = new URLSearchParams(window.location.search);
            const proprietarioId = urlParams.get('proprietarioId');
            
            if (proprietarioId && proprietarios[proprietarioId]) {
              return (
                <p className="text-gray-600 mt-1">
                  Filtrando imóveis de: <span className="font-medium">{proprietarios[proprietarioId].nome}</span>
                  <Link href="/imoveis" className="text-blue-600 hover:text-blue-800 ml-2 text-sm">
                    (Limpar filtro)
                  </Link>
                </p>
              );
            }
            return null;
          })()}
        </div>
        <div className="flex space-x-2">
          <Link 
            href="/imoveis/novo" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            Novo Imóvel
          </Link>
          <Link 
            href="/proprietarios" 
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            Ver Proprietários
          </Link>
          <Link 
            href="/inquilinos" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            Ver Inquilinos
          </Link>
        </div>
      </div>

      {imoveis.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-800 font-medium">Nenhum imóvel cadastrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-800">Proprietário</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-800">Endereço</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-800">Bairro</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-800">Cidade/UF</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-800">Tipo</th>
                <th className="py-3 px-4 text-center font-semibold text-gray-800">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {imoveis.map((imovel) => (
                <tr key={imovel.id} className="hover:bg-gray-50 text-gray-800">
                  <td className="py-3 px-4">
                    {proprietarios[imovel.proprietarioId]?.nome || 'Proprietário não encontrado'}
                  </td>
                  <td className="py-3 px-4">
                    {imovel.endereco}, {imovel.numero}
                    {imovel.complemento && ` - ${imovel.complemento}`}
                  </td>
                  <td className="py-3 px-4">{imovel.bairro}</td>
                  <td className="py-3 px-4">{imovel.cidade}/{imovel.estado}</td>
                  <td className="py-3 px-4">{getTipoLabel(imovel.tipo)}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-3">
                      <Link 
                        href={`/imoveis/editar/${imovel.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </Link>
                      <Link 
                        href={`/inquilinos?imovelId=${imovel.id}`}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Inquilinos
                      </Link>
                      <Link 
                        href={`/inquilinos/novo?imovelId=${imovel.id}`}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        + Inquilino
                      </Link>
                      <AdminOnly>
                        <button
                          onClick={() => handleDelete(imovel.id)}
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
