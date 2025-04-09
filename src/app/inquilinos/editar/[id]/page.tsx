'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export default function EditarInquilinoPage({ params }: Params) {
  const router = useRouter();
  // Usar React.use() para desembrulhar o objeto params que agora é uma Promise
  const { id } = React.use(params);
  
  const [imoveis, setImoveis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para o formulário
  const [formData, setFormData] = useState({
    imovelId: '',
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    dataInicioContrato: '',
    dataFimContrato: '',
    valorAluguel: '',
    diaVencimento: '',
    ativo: true,
    observacoes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados do inquilino
        const inquilinoResponse = await fetch(`/api/inquilinos/${id}`);
        if (!inquilinoResponse.ok) {
          throw new Error('Falha ao buscar dados do inquilino');
        }
        
        const inquilinoData = await inquilinoResponse.json();
        
        // Formatar as datas para o formato esperado pelo input type="date"
        const formatarDataParaInput = (dataString: string | undefined) => {
          if (!dataString) return '';
          const data = new Date(dataString);
          return data.toISOString().split('T')[0];
        };
        
        setFormData({
          imovelId: inquilinoData.imovelId,
          nome: inquilinoData.nome,
          cpf: inquilinoData.cpf,
          telefone: inquilinoData.telefone,
          email: inquilinoData.email,
          dataInicioContrato: formatarDataParaInput(inquilinoData.dataInicioContrato),
          dataFimContrato: formatarDataParaInput(inquilinoData.dataFimContrato),
          valorAluguel: inquilinoData.valorAluguel.toString(),
          diaVencimento: inquilinoData.diaVencimento.toString(),
          ativo: inquilinoData.ativo,
          observacoes: inquilinoData.observacoes || ''
        });

        // Buscar imóveis disponíveis
        const imoveisResponse = await fetch('/api/imoveis');
        if (!imoveisResponse.ok) {
          throw new Error('Falha ao buscar imóveis');
        }
        
        const imoveisData = await imoveisResponse.json();
        setImoveis(imoveisData);
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const formatCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    setFormData({
      ...formData,
      cpf: value
    });
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors.cpf) {
      setErrors({
        ...errors,
        cpf: ''
      });
    }
  };

  const formatTelefone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      if (value.length > 9) value = `${value.slice(0, 9)}-${value.slice(9)}`;
    }
    
    setFormData({
      ...formData,
      telefone: value
    });
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors.telefone) {
      setErrors({
        ...errors,
        telefone: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.imovelId.trim()) {
      newErrors.imovelId = 'Imóvel é obrigatório';
    }
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = 'CPF deve estar no formato 000.000.000-00';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.dataInicioContrato) {
      newErrors.dataInicioContrato = 'Data de início do contrato é obrigatória';
    }
    
    if (!formData.valorAluguel) {
      newErrors.valorAluguel = 'Valor do aluguel é obrigatório';
    }
    
    if (!formData.diaVencimento) {
      newErrors.diaVencimento = 'Dia de vencimento é obrigatório';
    } else {
      const dia = parseInt(formData.diaVencimento);
      if (isNaN(dia) || dia < 1 || dia > 31) {
        newErrors.diaVencimento = 'Dia de vencimento deve ser entre 1 e 31';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/inquilinos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar inquilino');
      }

      // Redirecionar para a lista de inquilinos após a atualização
      router.push('/inquilinos');
    } catch (err) {
      console.error('Erro ao atualizar inquilino:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar inquilino');
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
        <h1 className="text-2xl font-bold text-gray-800">Editar Inquilino</h1>
        <Link 
          href="/inquilinos" 
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
                Imóvel *
              </label>
              <select
                name="imovelId"
                value={formData.imovelId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              >
                <option value="">Selecione um imóvel</option>
              {errors.imovelId && <p className="text-red-500 text-sm mt-1">{errors.imovelId}</p>}
                {imoveis.map((imovel) => (
                  <option key={imovel.id} value={imovel.id}>
                    {imovel.endereco}, {imovel.numero} - {imovel.bairro}, {imovel.cidade}/{imovel.estado}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                CPF *
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={formatCPF}
                maxLength={14}
                placeholder="000.000.000-00"
                className={`w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.cpf ? 'border-red-500' : ''}`}
                required
              />
              {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Telefone *
              </label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={formatTelefone}
                maxLength={15}
                placeholder="(00) 00000-0000"
                className={`w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.telefone ? 'border-red-500' : ''}`}
                required
              />
              {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemplo@email.com"
                className={`w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.email ? 'border-red-500' : ''}`}
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Data Início do Contrato *
              </label>
              <input
                type="date"
                name="dataInicioContrato"
                value={formData.dataInicioContrato}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Data Fim do Contrato
              </label>
              <input
                type="date"
                name="dataFimContrato"
                value={formData.dataFimContrato}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Valor do Aluguel (R$) *
              </label>
              <input
                type="number"
                name="valorAluguel"
                value={formData.valorAluguel}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Dia de Vencimento *
              </label>
              <input
                type="number"
                name="diaVencimento"
                value={formData.diaVencimento}
                onChange={handleChange}
                min="1"
                max="31"
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-800 font-medium">Inquilino Ativo</span>
              </label>
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
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                submitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Salvando...' : 'Atualizar Inquilino'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
