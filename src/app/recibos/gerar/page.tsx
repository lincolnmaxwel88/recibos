'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentDate, formatToISODate, formatToBrazilianDate, isoToBrazilianDate, brazilianToISODate, applyDateMask } from '@/utils/dateUtils';

export default function GerarReciboPage() {
  const router = useRouter();
  const [inquilinos, setInquilinos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inquilinoSelecionado, setInquilinoSelecionado] = useState<any | null>(null);
  const [imovel, setImovel] = useState<any | null>(null);
  const [proprietario, setProprietario] = useState<any | null>(null);

  // Estado para o formulário
  const [formData, setFormData] = useState({
    inquilinoId: '',
    mesReferencia: '',
    anoReferencia: new Date().getFullYear().toString(),
    valorAgua: '0',
    valorLuz: '0',
    valorIptu: '0',
    valorJuros: '0',
    observacoes: '',
    // Novos campos para o recibo
    proximoReajuste: '',
    formaReajuste: 'Anual',
    vencimentoContrato: '',
    tipoAluguel: 'Residencial',
    vencimento: '',
    codigoLocatario: '',
    numeroRecibo: '',
    // Campos adicionais para valores específicos
    valorCorrMont: '0',
    valorJuridico: '0',
    valorBonificacao: '0',
    valorAbatimento: '0',
    valorIRF: '0'
  });

  // Lista de meses para o select
  const meses = [
    { valor: '01', nome: 'Janeiro' },
    { valor: '02', nome: 'Fevereiro' },
    { valor: '03', nome: 'Março' },
    { valor: '04', nome: 'Abril' },
    { valor: '05', nome: 'Maio' },
    { valor: '06', nome: 'Junho' },
    { valor: '07', nome: 'Julho' },
    { valor: '08', nome: 'Agosto' },
    { valor: '09', nome: 'Setembro' },
    { valor: '10', nome: 'Outubro' },
    { valor: '11', nome: 'Novembro' },
    { valor: '12', nome: 'Dezembro' }
  ];

  // Preencher o mês atual como padrão
  useEffect(() => {
    const mesAtual = (new Date().getMonth() + 1).toString().padStart(2, '0');
    setFormData(prev => ({ ...prev, mesReferencia: mesAtual }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar se há um inquilino pré-selecionado na URL
        const urlParams = new URLSearchParams(window.location.search);
        const inquilinoId = urlParams.get('inquilinoId');

        // Buscar inquilinos ativos
        const response = await fetch('/api/inquilinos?ativos=true');
        if (!response.ok) {
          throw new Error('Falha ao buscar inquilinos');
        }
        
        const data = await response.json();
        setInquilinos(data);
        
        // Se tiver um inquilino pré-selecionado, selecionar ele
        if (inquilinoId) {
          setFormData(prev => ({ ...prev, inquilinoId }));
          const inquilino = data.find((i: any) => i.id === inquilinoId);
          if (inquilino) {
            await carregarDadosInquilino(inquilino);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar inquilinos:', err);
        setError('Falha ao carregar inquilinos. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const carregarDadosInquilino = async (inquilino: any) => {
    try {
      setInquilinoSelecionado(inquilino);
      
      // Buscar dados do imóvel
      const imovelResponse = await fetch(`/api/imoveis/${inquilino.imovelId}`);
      if (!imovelResponse.ok) {
        throw new Error('Falha ao buscar dados do imóvel');
      }
      const imovelData = await imovelResponse.json();
      setImovel(imovelData);
      
      // Buscar dados do proprietário
      const proprietarioResponse = await fetch(`/api/proprietarios/${imovelData.proprietarioId}`);
      if (!proprietarioResponse.ok) {
        throw new Error('Falha ao buscar dados do proprietário');
      }
      const proprietarioData = await proprietarioResponse.json();
      setProprietario(proprietarioData);
      
      // Buscar todos os recibos do inquilino e usar o mais recente
      try {
        console.log('Buscando recibos do inquilino:', inquilino.id);
        const recibosResponse = await fetch(`/api/recibos/inquilino/${inquilino.id}`);
        console.log('Status da resposta:', recibosResponse.status);
        
        if (recibosResponse.ok) {
          const recibos = await recibosResponse.json();
          console.log('Recibos encontrados:', recibos.length);
          
          if (recibos.length > 0) {
            // Ordenar recibos por data de criação (mais recente primeiro)
            recibos.sort((a: any, b: any) => {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            
            const ultimoRecibo = recibos[0];
            console.log('Último recibo encontrado:', ultimoRecibo);
            
            // Preencher o formulário com os dados do último recibo
            setFormData(prev => {
              const novoFormData = {
                ...prev,
                inquilinoId: inquilino.id,
                // Manter o mês e ano atuais
                valorAgua: ultimoRecibo.valorAgua ? ultimoRecibo.valorAgua.toString() : '0',
                valorLuz: ultimoRecibo.valorLuz ? ultimoRecibo.valorLuz.toString() : '0',
                valorIptu: ultimoRecibo.valorIptu ? ultimoRecibo.valorIptu.toString() : '0',
                valorJuros: ultimoRecibo.valorJuros ? ultimoRecibo.valorJuros.toString() : '0',
                observacoes: ultimoRecibo.observacoes || '',
                // Garantir que as datas estejam no formato ISO (yyyy-mm-dd)
                proximoReajuste: ultimoRecibo.proximoReajuste || '',
                formaReajuste: ultimoRecibo.formaReajuste || 'Anual',
                vencimentoContrato: ultimoRecibo.vencimentoContrato || '',
                tipoAluguel: ultimoRecibo.tipoAluguel || 'Residencial',
                vencimento: ultimoRecibo.vencimento || '',
                codigoLocatario: ultimoRecibo.codigoLocatario || '',
                numeroRecibo: '', // Número do recibo deve ser novo
                valorCorrMont: ultimoRecibo.valorCorrMont ? ultimoRecibo.valorCorrMont.toString() : '0',
                valorJuridico: ultimoRecibo.valorJuridico ? ultimoRecibo.valorJuridico.toString() : '0',
                valorBonificacao: ultimoRecibo.valorBonificacao ? ultimoRecibo.valorBonificacao.toString() : '0',
                valorAbatimento: ultimoRecibo.valorAbatimento ? ultimoRecibo.valorAbatimento.toString() : '0',
                valorIRF: ultimoRecibo.valorIRF ? ultimoRecibo.valorIRF.toString() : '0'
              };
              console.log('Novo formData:', novoFormData);
              return novoFormData;
            });
          }
        }
      } catch (reciboErr) {
        // Se não encontrar um recibo anterior, não é um erro crítico
        console.log('Nenhum recibo anterior encontrado para este inquilino');
      }
    } catch (err) {
      console.error('Erro ao carregar dados relacionados:', err);
      setError('Falha ao carregar dados do imóvel ou proprietário.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'inquilinoId' && value) {
      const inquilinoSelecionado = inquilinos.find(i => i.id === value);
      if (inquilinoSelecionado) {
        carregarDadosInquilino(inquilinoSelecionado);
      }
    }
    
    setFormData({ ...formData, [name]: value });
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
  
  // Usando as funções de utilitário de data importadas de @/utils/dateUtils

  const calcularTotal = () => {
    const valorAluguel = inquilinoSelecionado ? inquilinoSelecionado.valorAluguel : 0;
    const valorAgua = parseFloat(formData.valorAgua) || 0;
    const valorLuz = parseFloat(formData.valorLuz) || 0;
    const valorIptu = parseFloat(formData.valorIptu) || 0;
    const valorJuros = parseFloat(formData.valorJuros) || 0;
    
    return valorAluguel + valorAgua + valorLuz + valorIptu + valorJuros;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.inquilinoId) {
      alert('Por favor, selecione um inquilino');
      return;
    }
    
    if (!formData.mesReferencia) {
      alert('Por favor, selecione o mês de referência');
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      // Garantir que as datas estejam no formato ISO (yyyy-mm-dd) antes de enviar
      const dadosParaEnviar = {
        ...formData,
        // Garantir que todas as datas estejam no formato ISO correto
        proximoReajuste: formData.proximoReajuste,
        vencimentoContrato: formData.vencimentoContrato,
        vencimento: formData.vencimento,
        // Usar o fuso horário de Brasília para a data de emissão
        dataEmissao: formatToISODate(getCurrentDate())
      };
      
      console.log('Enviando dados do recibo:', dadosParaEnviar);
      
      const response = await fetch('/api/recibos/gerar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar recibo');
      }

      // Redirecionar para a visualização do recibo gerado
      router.push(`/recibos/${data.id}`);
    } catch (err) {
      console.error('Erro ao gerar recibo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao gerar recibo');
      setSubmitting(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Gerar Novo Recibo</h1>
        <Link 
          href="/recibos" 
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition duration-300"
        >
          Voltar
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg shadow-md p-6 border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-800 font-medium mb-2">
                Inquilino *
              </label>
              <select
                name="inquilinoId"
                value={formData.inquilinoId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              >
                <option value="">Selecione um inquilino</option>
                {inquilinos.map((inquilino) => (
                  <option key={inquilino.id} value={inquilino.id}>
                    {inquilino.nome} - Aluguel: {formatarMoeda(inquilino.valorAluguel)}
                  </option>
                ))}
              </select>
            </div>

            {inquilinoSelecionado && imovel && proprietario && (
              <div className="col-span-1 md:col-span-2 bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Dados do Contrato</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Inquilino:</p>
                    <p className="font-medium text-gray-900">{inquilinoSelecionado.nome}</p>
                    <p className="text-sm text-gray-500">{inquilinoSelecionado.telefone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Imóvel:</p>
                    <p className="font-medium text-gray-900">{imovel.endereco}, {imovel.numero}</p>
                    <p className="text-sm text-gray-500">{imovel.bairro}, {imovel.cidade}/{imovel.estado}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Proprietário:</p>
                    <p className="font-medium text-gray-900">{proprietario.nome}</p>
                    <p className="text-sm text-gray-500">{proprietario.telefone}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Valor do Aluguel:</p>
                      <p className="font-medium text-gray-900">{formatarMoeda(inquilinoSelecionado.valorAluguel)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vencimento:</p>
                      <p className="font-medium text-gray-900">Dia {inquilinoSelecionado.diaVencimento} de cada mês</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Início do Contrato:</p>
                      <p className="font-medium text-gray-900">{new Date(inquilinoSelecionado.dataInicioContrato).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Mês de Referência *
              </label>
              <select
                name="mesReferencia"
                value={formData.mesReferencia}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              >
                <option value="">Selecione o mês</option>
                {meses.map((mes) => (
                  <option key={mes.valor} value={mes.valor}>
                    {mes.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Ano de Referência *
              </label>
              <input
                type="number"
                name="anoReferencia"
                value={formData.anoReferencia}
                onChange={handleChange}
                min="2020"
                max="2050"
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Valor da Água (R$)
              </label>
              <input
                type="number"
                name="valorAgua"
                value={formData.valorAgua}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Valor da Luz (R$)
              </label>
              <input
                type="number"
                name="valorLuz"
                value={formData.valorLuz}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Valor do IPTU (R$)
              </label>
              <input
                type="number"
                name="valorIptu"
                value={formData.valorIptu}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Valor de Juros/Multa (R$)
              </label>
              <input
                type="number"
                name="valorJuros"
                value={formData.valorJuros}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-800 font-medium mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Informações adicionais para o recibo..."
              ></textarea>
            </div>

            {/* Novos campos para o formato de recibo */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Valores Adicionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    Corr.Mont. (R$)
                  </label>
                  <input
                    type="number"
                    name="valorCorrMont"
                    value={formData.valorCorrMont}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    Jurídico (R$)
                  </label>
                  <input
                    type="number"
                    name="valorJuridico"
                    value={formData.valorJuridico}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    Bonificação (R$)
                  </label>
                  <input
                    type="number"
                    name="valorBonificacao"
                    value={formData.valorBonificacao}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    Abatimento/Cred Diversos (R$)
                  </label>
                  <input
                    type="number"
                    name="valorAbatimento"
                    value={formData.valorAbatimento}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    I.R.F (R$)
                  </label>
                  <input
                    type="number"
                    name="valorIRF"
                    value={formData.valorIRF}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Informações Adicionais do Recibo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    Próximo Reajuste
                  </label>
                  <input
                    type="text"
                    name="proximoReajuste"
                    value={isoToBrazilianDate(formData.proximoReajuste)}
                    onChange={(e) => {
                      // Aplicar máscara de data (dd/mm/yyyy)
                      const value = applyDateMask(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        proximoReajuste: value.length === 10 ? brazilianToISODate(value) : value
                      }));
                    }}
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    Forma de Reajuste
                  </label>
                  <select
                    name="formaReajuste"
                    value={formData.formaReajuste}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="Anual">Anual</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Trimestral">Trimestral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    Vencimento do Contrato
                  </label>
                  <input
                    type="text"
                    name="vencimentoContrato"
                    value={isoToBrazilianDate(formData.vencimentoContrato)}
                    onChange={(e) => {
                      // Aplicar máscara de data (dd/mm/yyyy)
                      const value = applyDateMask(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        vencimentoContrato: value.length === 10 ? brazilianToISODate(value) : value
                      }));
                    }}
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    Tipo de Aluguel
                  </label>
                  <select
                    name="tipoAluguel"
                    value={formData.tipoAluguel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="Residencial">Residencial</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Comercial/Residencial">Comercial/Residencial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    Vencimento
                  </label>
                  <input
                    type="text"
                    name="vencimento"
                    value={isoToBrazilianDate(formData.vencimento)}
                    onChange={(e) => {
                      // Aplicar máscara de data (dd/mm/yyyy)
                      const value = applyDateMask(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        vencimento: value.length === 10 ? brazilianToISODate(value) : value
                      }));
                    }}
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    Código Locatário
                  </label>
                  <input
                    type="text"
                    name="codigoLocatario"
                    value={formData.codigoLocatario}
                    onChange={handleChange}
                    placeholder="Código do locatário (opcional)"
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    Número do Recibo
                  </label>
                  <input
                    type="text"
                    name="numeroRecibo"
                    value={formData.numeroRecibo}
                    onChange={handleChange}
                    placeholder="Número do recibo (opcional)"
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {inquilinoSelecionado && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">Resumo do Recibo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Aluguel:</p>
                  <p className="font-medium text-gray-900">{formatarMoeda(inquilinoSelecionado.valorAluguel)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Água:</p>
                  <p className="font-medium text-gray-900">{formatarMoeda(parseFloat(formData.valorAgua) || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Luz:</p>
                  <p className="font-medium text-gray-900">{formatarMoeda(parseFloat(formData.valorLuz) || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">IPTU:</p>
                  <p className="font-medium text-gray-900">{formatarMoeda(parseFloat(formData.valorIptu) || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Juros/Multa:</p>
                  <p className="font-medium text-gray-900">{formatarMoeda(parseFloat(formData.valorJuros) || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">TOTAL:</p>
                  <p className="font-bold text-lg text-blue-700">{formatarMoeda(calcularTotal())}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !inquilinoSelecionado}
              className={`px-4 py-2 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                submitting || !inquilinoSelecionado ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Gerando...' : 'Gerar Recibo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
