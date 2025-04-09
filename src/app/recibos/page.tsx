'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Recibo } from '@/types/recibo';
import { useAuth } from '@/contexts/AuthContext';
import AdminOnly from '@/components/AdminOnly';

export default function RecibosPage() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [inquilinos, setInquilinos] = useState<{[key: string]: any}>({});
  const [imoveis, setImoveis] = useState<{[key: string]: any}>({});
  const [proprietarios, setProprietarios] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroInquilinoId, setFiltroInquilinoId] = useState<string | null>(null);
  const [filtroImovelId, setFiltroImovelId] = useState<string | null>(null);
  const [inquilinoNome, setInquilinoNome] = useState<string | null>(null);
  const [imovelEndereco, setImovelEndereco] = useState<string | null>(null);
  const { usuario } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar se há filtros na URL
        const urlParams = new URLSearchParams(window.location.search);
        const inquilinoId = urlParams.get('inquilinoId');
        const imovelId = urlParams.get('imovelId');
        setFiltroInquilinoId(inquilinoId);
        setFiltroImovelId(imovelId);
        
        // Buscar recibos (filtrados se houver parâmetros)
        let recibosUrl = '/api/recibos';
        if (inquilinoId) {
          recibosUrl += `?inquilinoId=${inquilinoId}`;
        } else if (imovelId) {
          recibosUrl += `?imovelId=${imovelId}`;
        }
          
        const recibosResponse = await fetch(recibosUrl);
        if (!recibosResponse.ok) {
          throw new Error('Falha ao buscar recibos');
        }
        const recibosData = await recibosResponse.json();
        setRecibos(recibosData);

        // Buscar inquilinos
        const inquilinosResponse = await fetch('/api/inquilinos');
        if (!inquilinosResponse.ok) {
          throw new Error('Falha ao buscar inquilinos');
        }
        const inquilinosData = await inquilinosResponse.json();
        
        // Criar um mapa de inquilinos
        const inquilinosMap: {[key: string]: any} = {};
        inquilinosData.forEach((inquilino: any) => {
          inquilinosMap[inquilino.id] = inquilino;
        });
        setInquilinos(inquilinosMap);
        
        // Buscar imóveis
        const imoveisResponse = await fetch('/api/imoveis');
        if (!imoveisResponse.ok) {
          throw new Error('Falha ao buscar imóveis');
        }
        const imoveisData = await imoveisResponse.json();
        
        // Criar um mapa de imóveis
        const imoveisMap: {[key: string]: any} = {};
        imoveisData.forEach((imovel: any) => {
          imoveisMap[imovel.id] = imovel;
        });
        setImoveis(imoveisMap);

        // Buscar proprietários
        const proprietariosResponse = await fetch('/api/proprietarios');
        if (!proprietariosResponse.ok) {
          throw new Error('Falha ao buscar proprietários');
        }
        const proprietariosData = await proprietariosResponse.json();
        
        // Criar um mapa de proprietários
        const proprietariosMap: {[key: string]: any} = {};
        proprietariosData.forEach((proprietario: any) => {
          proprietariosMap[proprietario.id] = proprietario;
        });
        setProprietarios(proprietariosMap);
        
        // Se tiver filtro de inquilino, buscar o nome
        if (inquilinoId && inquilinosMap[inquilinoId]) {
          setInquilinoNome(inquilinosMap[inquilinoId].nome);
        }
        
        // Se tiver filtro de imóvel, buscar o endereço
        if (imovelId && imoveisMap[imovelId]) {
          const imovel = imoveisMap[imovelId];
          setImovelEndereco(`${imovel.endereco}, ${imovel.numero}`);
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
    if (window.confirm('Tem certeza que deseja excluir este recibo?')) {
      try {
        const response = await fetch(`/api/recibos/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Falha ao excluir recibo');
        }

        // Atualizar a lista após a exclusão
        setRecibos(recibos.filter(recibo => recibo.id !== id));
      } catch (err) {
        console.error('Erro ao excluir recibo:', err);
        alert('Erro ao excluir recibo. Por favor, tente novamente.');
      }
    }
  };

  const handleMarcarComoPago = async (id: string) => {
    try {
      const dataAtual = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/recibos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pago: true,
          dataPagamento: dataAtual
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao marcar recibo como pago');
      }

      const reciboAtualizado = await response.json();
      
      // Atualizar a lista
      setRecibos(recibos.map(recibo => 
        recibo.id === id ? reciboAtualizado : recibo
      ));
    } catch (err) {
      console.error('Erro ao marcar recibo como pago:', err);
      alert('Erro ao marcar recibo como pago. Por favor, tente novamente.');
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

  const getNomeMes = (mes: string) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 
      'Maio', 'Junho', 'Julho', 'Agosto', 
      'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mesNumero = parseInt(mes);
    return meses[mesNumero - 1];
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
          <h1 className="text-2xl font-bold text-white">Recibos</h1>
          {filtroInquilinoId && inquilinoNome && (
            <p className="text-gray-600 mt-1">
              Filtrando recibos do inquilino: <span className="font-medium">{inquilinoNome}</span>
              <Link href="/recibos" className="text-blue-600 hover:text-blue-800 ml-2 text-sm">
                (Limpar filtro)
              </Link>
            </p>
          )}
          {filtroImovelId && imovelEndereco && (
            <p className="text-gray-600 mt-1">
              Filtrando recibos do imóvel: <span className="font-medium">{imovelEndereco}</span>
              <Link href="/recibos" className="text-blue-600 hover:text-blue-800 ml-2 text-sm">
                (Limpar filtro)
              </Link>
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Link 
            href="/recibos/gerar" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            Gerar Recibo
          </Link>
          <Link 
            href="/inquilinos" 
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            Ver Inquilinos
          </Link>
        </div>
      </div>

      {recibos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-700 mb-4">Nenhum recibo encontrado.</p>
          <Link 
            href="/recibos/gerar" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Gerar um novo recibo
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquilino/Imóvel</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referência</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluguel</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contas</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recibos.map((recibo) => (
                  <tr key={recibo.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {inquilinos[recibo.inquilinoId] && imoveis[recibo.imovelId] ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {inquilinos[recibo.inquilinoId].nome}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {imoveis[recibo.imovelId].endereco}, {imoveis[recibo.imovelId].numero}
                          </div>
                        </div>
                      ) : (
                        <span className="text-red-500">Dados não encontrados</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {getNomeMes(recibo.mesReferencia)}/{recibo.anoReferencia}
                        </div>
                        <div className="text-gray-500 text-sm">
                          Emissão: {formatarData(recibo.dataEmissao)}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatarMoeda(recibo.valorAluguel)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">
                        Água: {formatarMoeda(recibo.valorAgua)}
                      </div>
                      <div className="text-sm text-gray-900">
                        Luz: {formatarMoeda(recibo.valorLuz)}
                      </div>
                      <div className="text-sm text-gray-900">
                        IPTU: {formatarMoeda(recibo.valorIptu)}
                      </div>
                      {recibo.valorJuros > 0 && (
                        <div className="text-sm text-red-600">
                          Juros: {formatarMoeda(recibo.valorJuros)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatarMoeda(recibo.valorTotal)}
                    </td>
                    <td className="py-3 px-4">
                      {recibo.pago ? (
                        <div>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Pago
                          </span>
                          {recibo.dataPagamento && (
                            <div className="text-xs text-gray-500 mt-1">
                              Em: {formatarData(recibo.dataPagamento)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <Link 
                          href={`/recibos/${recibo.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Visualizar
                        </Link>
                        {!recibo.pago && (
                          <button
                            onClick={() => handleMarcarComoPago(recibo.id)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Marcar Pago
                          </button>
                        )}
                        <AdminOnly>
                          <button
                            onClick={() => handleDelete(recibo.id)}
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
