'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Inquilino } from '@/types/inquilino';
import { useAuth } from '@/contexts/AuthContext';
import AdminOnly from '@/components/AdminOnly';

export default function InquilinosPage() {
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [imoveis, setImoveis] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroImovelId, setFiltroImovelId] = useState<string | null>(null);
  const [imovelNome, setImovelNome] = useState<string | null>(null);
  const { usuario } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar se há um filtro de imóvel na URL
        const urlParams = new URLSearchParams(window.location.search);
        const imovelId = urlParams.get('imovelId');
        setFiltroImovelId(imovelId);
        
        // Buscar inquilinos (filtrados por imóvel se o parâmetro estiver presente)
        const inquilinosUrl = imovelId 
          ? `/api/inquilinos?imovelId=${imovelId}`
          : '/api/inquilinos';
          
        const inquilinosResponse = await fetch(inquilinosUrl);
        if (!inquilinosResponse.ok) {
          throw new Error('Falha ao buscar inquilinos');
        }
        const inquilinosData = await inquilinosResponse.json();
        setInquilinos(inquilinosData);

        // Buscar imóveis para exibir informações
        const imoveisResponse = await fetch('/api/imoveis');
        if (!imoveisResponse.ok) {
          throw new Error('Falha ao buscar imóveis');
        }
        const imoveisData = await imoveisResponse.json();
        
        // Criar um mapa de imóveis para facilitar o acesso
        const imoveisMap: {[key: string]: any} = {};
        imoveisData.forEach((imovel: any) => {
          imoveisMap[imovel.id] = imovel;
        });
        setImoveis(imoveisMap);
        
        // Se tiver filtro, buscar o nome do imóvel
        if (imovelId && imoveisMap[imovelId]) {
          const endereco = imoveisMap[imovelId].endereco;
          const numero = imoveisMap[imovelId].numero;
          setImovelNome(`${endereco}, ${numero}`);
        }

        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este inquilino?')) {
      try {
        const response = await fetch(`/api/inquilinos/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Falha ao excluir inquilino');
        }

        // Atualizar a lista após a exclusão
        setInquilinos(inquilinos.filter(inquilino => inquilino.id !== id));
      } catch (err) {
        console.error('Erro ao excluir inquilino:', err);
        alert('Erro ao excluir inquilino. Por favor, tente novamente.');
      }
    }
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number | undefined | null) => {
    // Verificar se o valor é válido (não é undefined, null ou NaN)
    if (valor === undefined || valor === null || isNaN(valor)) {
      return 'R$ 0,00';
    }
    
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-700">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Inquilinos</h1>
          {filtroImovelId && imovelNome && (
            <p className="text-gray-600 mt-1">
              Filtrando inquilinos do imóvel: <span className="font-medium">{imovelNome}</span>
              <Link href="/inquilinos" className="text-blue-600 hover:text-blue-800 ml-2 text-sm">
                (Limpar filtro)
              </Link>
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Link 
            href="/inquilinos/novo" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            Novo Inquilino
          </Link>
          <Link 
            href="/recibos" 
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            Recibos
          </Link>
          <Link 
            href="/imoveis" 
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            Ver Imóveis
          </Link>
        </div>
      </div>

      {inquilinos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-700 mb-4">Nenhum inquilino encontrado.</p>
          <Link 
            href="/inquilinos/novo" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Cadastrar um novo inquilino
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imóvel</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrato</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquilinos.map((inquilino) => (
                  <tr key={inquilino.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{inquilino.nome}</div>
                        <div className="text-gray-500 text-sm">{inquilino.telefone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {imoveis[inquilino.imovelId] ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {imoveis[inquilino.imovelId].endereco}, {imoveis[inquilino.imovelId].numero}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {imoveis[inquilino.imovelId].bairro}, {imoveis[inquilino.imovelId].cidade}
                          </div>
                        </div>
                      ) : (
                        <span className="text-red-500">Imóvel não encontrado</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-gray-900">Início: {formatarData(inquilino.dataInicioContrato)}</div>
                        {inquilino.dataFimContrato && (
                          <div className="text-gray-500 text-sm">Fim: {formatarData(inquilino.dataFimContrato)}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{formatarMoeda(inquilino.valorAluguel)}</div>
                        <div className="text-gray-500 text-sm">Vence dia {inquilino.diaVencimento}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {inquilino.ativo ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-3">
                        <Link 
                          href={`/inquilinos/editar/${inquilino.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Editar
                        </Link>
                        <Link 
                          href={`/recibos?inquilinoId=${inquilino.id}`}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Recibos
                        </Link>
                        <Link 
                          href={`/recibos/gerar?inquilinoId=${inquilino.id}`}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Gerar Recibo
                        </Link>
                        <AdminOnly>
                          <button
                            onClick={() => handleDelete(inquilino.id)}
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
        </div>
      )}
    </div>
  );
}
