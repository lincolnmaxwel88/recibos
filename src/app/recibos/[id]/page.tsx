'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { use } from 'react';
import { Recibo } from '@/types/recibo';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export default function VisualizarReciboPage({ params }: Params) {
  const router = useRouter();
  // Usar React.use() para desembrulhar o objeto params que agora é uma Promise
  const { id } = React.use(params);
  const printRef = useRef<HTMLDivElement>(null);
  
  const [recibo, setRecibo] = useState<Recibo | null>(null);
  const [inquilino, setInquilino] = useState<any | null>(null);
  const [imovel, setImovel] = useState<any | null>(null);
  const [proprietario, setProprietario] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados do recibo
        const reciboResponse = await fetch(`/api/recibos/${id}`);
        if (!reciboResponse.ok) {
          throw new Error('Falha ao buscar dados do recibo');
        }
        
        const reciboData = await reciboResponse.json();
        setRecibo(reciboData);
        
        // Buscar dados do inquilino
        const inquilinoResponse = await fetch(`/api/inquilinos/${reciboData.inquilinoId}`);
        if (!inquilinoResponse.ok) {
          throw new Error('Falha ao buscar dados do inquilino');
        }
        const inquilinoData = await inquilinoResponse.json();
        setInquilino(inquilinoData);
        
        // Buscar dados do imóvel
        const imovelResponse = await fetch(`/api/imoveis/${reciboData.imovelId}`);
        if (!imovelResponse.ok) {
          throw new Error('Falha ao buscar dados do imóvel');
        }
        const imovelData = await imovelResponse.json();
        setImovel(imovelData);
        
        // Buscar dados do proprietário
        const proprietarioResponse = await fetch(`/api/proprietarios/${reciboData.proprietarioId}`);
        if (!proprietarioResponse.ok) {
          throw new Error('Falha ao buscar dados do proprietário');
        }
        const proprietarioData = await proprietarioResponse.json();
        setProprietario(proprietarioData);
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    
    const originalContents = document.body.innerHTML;
    const printContents = printContent.innerHTML;
    
    document.body.innerHTML = `
      <style>
        @media print {
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #000;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
          
          /* Estilos para o novo layout de recibo */
          .print-content {
            border: 2px solid #000;
            margin-bottom: 20px;
            page-break-after: always;
            width: 100%;
            max-width: 800px;
            margin: 0 auto 20px;
          }
          
          .border-b, .border-b-2, .border-t, .border-r, .border-r-2, .border-l, .border-black {
            border-color: #000 !important;
          }
          
          .border-b { border-bottom: 1px solid #000; }
          .border-b-2 { border-bottom: 2px solid #000; }
          .border-t { border-top: 1px solid #000; }
          .border-r { border-right: 1px solid #000; }
          .border-r-2 { border-right: 2px solid #000; }
          .border-l { border-left: 1px solid #000; }
          
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          td, th {
            padding: 8px;
            color: #000;
          }
          
          .text-red-600 {
            color: #e53e3e !important;
          }
          
          .font-bold {
            font-weight: bold;
          }
          
          .text-center {
            text-align: center;
          }
          
          .text-right {
            text-align: right;
          }
          
          .flex {
            display: flex;
          }
          
          .justify-between {
            justify-content: space-between;
          }
          
          .items-center {
            align-items: center;
          }
          
          .items-end {
            align-items: flex-end;
          }
          
          .grid {
            display: grid;
          }
          
          .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          
          .w-1\/2 {
            width: 50%;
          }
          
          .w-1\/3 {
            width: 33.333333%;
          }
          
          .p-2 {
            padding: 0.5rem;
          }
          
          .pb-1 {
            padding-bottom: 0.25rem;
          }
          
          .pb-6 {
            padding-bottom: 1.5rem;
          }
          
          .mb-1 {
            margin-bottom: 0.25rem;
          }
          
          .mb-6 {
            margin-bottom: 1.5rem;
          }
          
          .mb-8 {
            margin-bottom: 2rem;
          }
          
          .text-xl {
            font-size: 1.25rem;
          }
          
          .text-sm {
            font-size: 0.875rem;
          }
          
          /* Estilos para a seção de observações */
          .print-section {
            margin-bottom: 15px;
            color: #000;
          }
          
          h3 {
            margin-bottom: 10px;
            color: #000;
            font-weight: bold;
          }
          
          p, span, div {
            color: #000;
          }
        }
      </style>
      <div>${printContents}</div>
    `;
    
    window.print();
    document.body.innerHTML = originalContents;
  };

  const handleMarcarComoPago = async () => {
    if (!recibo) return;
    
    try {
      const dataAtual = new Date().toISOString().split('T')[0];
      // Usar a API específica para marcar como pago
      const response = await fetch(`/api/recibos/${id}/pagar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataPagamento: dataAtual
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao marcar recibo como pago');
      }

      const reciboAtualizado = await response.json();
      setRecibo(reciboAtualizado);
    } catch (err) {
      console.error('Erro ao marcar recibo como pago:', err);
      alert('Erro ao marcar recibo como pago. Por favor, tente novamente.');
    }
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

  if (error || !recibo || !inquilino || !imovel || !proprietario) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Não foi possível carregar os dados do recibo'}</p>
          <Link 
            href="/recibos" 
            className="mt-2 inline-block bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
          >
            Voltar para Recibos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Visualizar Recibo</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            Imprimir Recibo
          </button>
          <Link 
            href="/recibos" 
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition duration-300"
          >
            Voltar
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Recibo de Aluguel - {getNomeMes(recibo.mesReferencia)}/{recibo.anoReferencia}
            </h2>
            <p className="text-gray-600">Emitido em: {formatarData(recibo.dataEmissao)}</p>
          </div>
          <div>
            {recibo.pago ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 font-medium rounded-full">
                PAGO - {recibo.dataPagamento && formatarData(recibo.dataPagamento)}
              </span>
            ) : (
              <div className="flex items-center">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 font-medium rounded-full mr-2">
                  PENDENTE
                </span>
                <button
                  onClick={handleMarcarComoPago}
                  className="text-sm bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded"
                >
                  Marcar como Pago
                </button>
              </div>
            )}
          </div>
        </div>

        <div ref={printRef}>
          {/* Primeiro recibo - para o inquilino */}
          <div className="print-content border-2 border-black mb-8">
            {/* Cabeçalho do recibo */}
            <div className="border-b-2 border-black">
              <div className="flex justify-between items-center p-2">
                <div className="text-xl font-bold text-gray-900">PIPPO</div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">ADVOCACIA - IMOVEIS</div>
                  <div className="text-gray-800 font-medium">CRECI Nº: 73501</div>
                </div>
              </div>
              <div className="border-t border-black p-2 text-center text-sm text-gray-800 font-medium">
                {imovel.cidade} - {imovel.endereco}, {imovel.numero}, {imovel.bairro}
              </div>
              <div className="border-t border-black p-2 text-center text-sm text-gray-800 font-medium">
                E-mail: {proprietario.email} - {window.location.host}
              </div>
            </div>
            
            {/* Informações do contrato e valores */}
            <div className="grid grid-cols-12 border-b-2 border-black">
              {/* Coluna da esquerda - 7/12 */}
              <div className="col-span-7 border-r-2 border-black">
                <table className="w-full table-fixed">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="p-2 w-3/5 text-gray-800 font-medium">
                        Próximo Reajuste: {recibo.proximoReajuste || '___/___/20__'}
                      </td>
                      <td className="p-2 border-l border-black w-1/5 text-gray-800 font-medium">Aluguel</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold w-1/5">
                        R$ {recibo.valorAluguel ? recibo.valorAluguel.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '1.000,00'}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 text-gray-800 font-medium">Forma de Reajuste: {recibo.formaReajuste || 'Anual'}</td>
                      <td className="p-2 border-l border-black text-gray-800 font-medium">Água</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ {recibo.valorAgua > 0 ? recibo.valorAgua.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 text-gray-800 font-medium">Vencimento do Contrato: {recibo.vencimentoContrato || '___/___/20__'}</td>
                      <td className="p-2 border-l border-black text-gray-800 font-medium">Luz</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ {recibo.valorLuz > 0 ? recibo.valorLuz.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 text-gray-800 font-medium">Aluguel <span className="text-red-600 font-bold">{recibo.tipoAluguel || 'Comercial/Residencial'}</span></td>
                      <td className="p-2 border-l border-black text-gray-800 font-medium">IPTU {recibo.mesReferencia}/{recibo.anoReferencia}</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ {recibo.valorIptu > 0 ? recibo.valorIptu.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '100,00'}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 text-gray-800 font-medium">Vencimento: {recibo.vencimento || '___/___/20__'}</td>
                      <td className="p-2 border-l border-black text-gray-800 font-medium">Sub-Total</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ {(recibo.valorAluguel + (recibo.valorIptu || 0)).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 text-gray-800 font-medium">Código Locatário: {recibo.codigoLocatario || inquilino.id.substring(0, 6)}</td>
                      <td className="p-2 border-l border-black text-gray-800 font-medium">I.R.F</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ {recibo.valorIRF !== null && recibo.valorIRF !== undefined ? recibo.valorIRF.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-gray-800 font-medium">Recibo de Aluguel nº: {recibo.numeroRecibo || `${recibo.mesReferencia.padStart(2, '0')}/${recibo.anoReferencia.toString().substring(2)}`}</td>
                      <td className="p-2 border-l border-black text-gray-800 font-medium">Juros Mora</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ {recibo.valorJuros > 0 ? recibo.valorJuros.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Coluna da direita - 5/12 */}
              <div className="col-span-5">
                <table className="w-full table-fixed">
                  <tbody>

                    <tr className="border-b border-black">
                      <td className="p-2 w-3/4 text-gray-800 font-medium">Corr.Mont.</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold w-1/4">
                        R$ {recibo.valorCorrMont !== null && recibo.valorCorrMont !== undefined ? recibo.valorCorrMont.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 text-gray-800 font-medium">Jurídico</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ {recibo.valorJuridico !== null && recibo.valorJuridico !== undefined ? recibo.valorJuridico.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 text-gray-800 font-medium">Bonificação</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ {recibo.valorBonificacao !== null && recibo.valorBonificacao !== undefined ? recibo.valorBonificacao.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 text-gray-800 font-medium">Abatimento/Cred Diversos</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ {recibo.valorAbatimento !== null && recibo.valorAbatimento !== undefined ? recibo.valorAbatimento.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-gray-900">TOTAL</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ {recibo.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Informações de recebimento */}
            <div className="p-2 border-t border-black">
              <p className="text-gray-800 font-medium mb-2">Recebemos de <span className="font-bold">{inquilino.nome}</span> a importância total de R$ {recibo.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="text-gray-800 font-medium mb-4">( {valorPorExtenso(recibo.valorTotal)} ) correspondente ao aluguel e demais encargos sobre o imóvel situado a Rua/Av: {imovel.endereco}, {imovel.numero}</p>
            </div>
            
            {/* Rodapé com data e assinatura */}
            <div className="p-2">
              <div className="flex justify-between">
                <div className="text-gray-800 font-medium">___/___/{new Date().getFullYear()}</div>
                <div className="text-center w-1/2">
                  <div className="border-b border-black pb-1 mb-1"></div>
                  <div className="font-bold text-gray-900">PIPPO ADVOCACIA - IMOVEIS</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Segundo recibo (para locadores) */}
          <div className="print-content border-2 border-black mb-6">
            {/* Cabeçalho do recibo */}
            <div className="border-b-2 border-black">
              <div className="flex justify-between items-center p-2">
                <div className="text-xl font-bold text-gray-900">PIPPO</div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">ADVOCACIA - IMOVEIS</div>
                  <div className="text-gray-800 font-medium">CRECI Nº: 73501</div>
                </div>
              </div>
              <div className="border-t border-black p-2 text-center text-sm text-gray-800 font-medium">
                {imovel.cidade} - {imovel.endereco}, {imovel.numero}, {imovel.bairro}
              </div>
              <div className="border-t border-black p-2 text-center text-sm text-gray-800 font-medium">
                E-mail: {proprietario.email} - {window.location.host}
              </div>
            </div>
            
            <div className="p-2 text-center font-bold border-b border-black text-gray-900">
              RECIBO PARA LOCADORES
            </div>
            
            <div className="p-2 border-b border-black">
              <p className="text-gray-800 font-medium">Inquilino: <span className="font-bold text-red-600">{inquilino.nome}</span></p>
              <p className="text-gray-800 font-medium">Pagamos ao Sr.(a). (<span className="font-bold text-red-600">{proprietario.nome}</span>) a quantia de <span className="font-bold text-red-600">R$ {recibo.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span> (<span className="font-bold text-red-600">{valorPorExtenso(recibo.valorTotal)}</span>).</p>
            </div>
            
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-2 border-r border-black">
                <p className="text-gray-800 font-medium">Correspondente locação referenciada abaixo vencida em ___/___/20__ do imovel localizado na Rua/Av: {imovel.endereco}, {imovel.numero}</p>
              </div>
              <div>
                <table className="w-full table-fixed">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="p-2 w-2/3 text-gray-800 font-medium">Aluguel</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold w-1/3">
                        R$ {recibo.valorAluguel.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 text-gray-800 font-medium">Adm.</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ 100,00
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 text-gray-800 font-medium">I.R.F</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ {recibo.valorIRF !== null && recibo.valorIRF !== undefined ? recibo.valorIRF.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-2 text-gray-800 font-medium">IPTU</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ {recibo.valorIptu > 0 ? recibo.valorIptu.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '100,00'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-gray-900">Total</td>
                      <td className="p-2 border-l border-black text-right text-red-600 font-bold">
                        R$ {recibo.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Informações de recebimento */}
            <div className="p-2 border-t border-black">
              <p className="text-gray-800 font-medium mb-2">Recebemos de <span className="font-bold">{inquilino.nome}</span> a importância total de R$ {recibo.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="text-gray-800 font-medium mb-4">( {valorPorExtenso(recibo.valorTotal)} ) correspondente ao aluguel e demais encargos sobre o imóvel situado a Rua/Av: {imovel.endereco}, {imovel.numero}</p>
            </div>
            
            {/* Rodapé com data e assinatura */}
            <div className="p-2">
              <div className="flex justify-between items-end">
                <div className="text-gray-800 font-medium">{imovel.cidade} ___/___/20__</div>
                <div className="text-center w-1/3">
                  <div className="border-b border-black pb-6 mb-1"></div>
                  <div className="text-red-600 font-bold">(NOME DA ADMINISTRADORA)</div>
                </div>
                <div className="text-center w-1/3">
                  <div className="border-b border-black pb-6 mb-1"></div>
                  <div className="text-red-600 font-bold">(NOME PROPRIETÁRIO)</div>
                </div>
              </div>
            </div>
          </div>
          
          {recibo.observacoes && (
            <div className="mb-6 print-section">
              <h3 className="font-bold text-gray-800 mb-2 border-b pb-1">Observações</h3>
              <p className="whitespace-pre-line text-gray-900">{recibo.observacoes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Função para converter valor numérico em texto por extenso
function valorPorExtenso(valor: number): string {
  if (valor === 0) return 'zero reais';
  
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezenas = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const dezenasEspeciais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  
  // Arredonda para 2 casas decimais e separa reais e centavos
  const valorFormatado = Math.round(valor * 100) / 100;
  const partes = valorFormatado.toFixed(2).split('.');
  const reais = parseInt(partes[0]);
  const centavos = parseInt(partes[1]);
  
  let resultado = '';
  
  // Processa reais
  if (reais > 0) {
    if (reais === 1) {
      resultado = 'um real';
    } else {
      // Milhares
      if (reais >= 1000) {
        const milhares = Math.floor(reais / 1000);
        if (milhares === 1) {
          resultado += 'mil ';
        } else {
          if (milhares < 10) {
            resultado += unidades[milhares] + ' mil ';
          } else if (milhares < 100) {
            const dezena = Math.floor(milhares / 10);
            const unidade = milhares % 10;
            if (dezena === 1 && unidade > 0) {
              resultado += dezenasEspeciais[unidade] + ' mil ';
            } else {
              resultado += dezenas[dezena];
              if (unidade > 0) {
                resultado += ' e ' + unidades[unidade];
              }
              resultado += ' mil ';
            }
          }
        }
      }
      
      // Centenas
      const resto = reais % 1000;
      if (resto >= 100) {
        const centena = Math.floor(resto / 100);
        if (resto === 100) {
          resultado += 'cem';
        } else {
          resultado += centenas[centena];
        }
        
        const restoDezenas = resto % 100;
        if (restoDezenas > 0) {
          resultado += ' e ';
        }
      }
      
      // Dezenas e unidades
      const restoDezenas = resto % 100;
      if (restoDezenas > 0) {
        if (restoDezenas < 10) {
          resultado += unidades[restoDezenas];
        } else if (restoDezenas < 20) {
          resultado += dezenasEspeciais[restoDezenas - 10];
        } else {
          const dezena = Math.floor(restoDezenas / 10);
          const unidade = restoDezenas % 10;
          resultado += dezenas[dezena];
          if (unidade > 0) {
            resultado += ' e ' + unidades[unidade];
          }
        }
      }
      
      resultado += ' reais';
    }
  }
  
  // Processa centavos
  if (centavos > 0) {
    if (reais > 0) {
      resultado += ' e ';
    }
    
    if (centavos === 1) {
      resultado += 'um centavo';
    } else if (centavos < 10) {
      resultado += unidades[centavos] + ' centavos';
    } else if (centavos < 20) {
      resultado += dezenasEspeciais[centavos - 10] + ' centavos';
    } else {
      const dezena = Math.floor(centavos / 10);
      const unidade = centavos % 10;
      resultado += dezenas[dezena];
      if (unidade > 0) {
        resultado += ' e ' + unidades[unidade];
      }
      resultado += ' centavos';
    }
  }
  
  return resultado;
}
