'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { Proprietario } from '@/types/proprietario';
import { Imovel } from '@/types/imovel';

interface EditarImovelPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditarImovelPage({ params }: EditarImovelPageProps) {
  const router = useRouter();
  // Usar React.use() para desembrulhar o objeto params que agora é uma Promise
  const { id } = React.use(params);
  
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [formData, setFormData] = useState({
    proprietarioId: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    tipo: '',
    observacoes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar proprietários
        const proprietariosResponse = await fetch('/api/proprietarios');
        if (!proprietariosResponse.ok) {
          throw new Error('Falha ao buscar proprietários');
        }
        const proprietariosData = await proprietariosResponse.json();
        setProprietarios(proprietariosData);
        
        // Buscar dados do imóvel
        const imovelResponse = await fetch(`/api/imoveis/${id}`);
        if (!imovelResponse.ok) {
          throw new Error('Imóvel não encontrado');
        }
        const imovelData = await imovelResponse.json();
        setFormData({
          proprietarioId: imovelData.proprietarioId,
          endereco: imovelData.endereco,
          numero: imovelData.numero,
          complemento: imovelData.complemento || '',
          bairro: imovelData.bairro,
          cidade: imovelData.cidade,
          estado: imovelData.estado,
          cep: imovelData.cep,
          tipo: imovelData.tipo,
          observacoes: imovelData.observacoes || ''
        });
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        alert('Não foi possível carregar os dados do imóvel.');
        router.push('/imoveis');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const formatCEP = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 8) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    
    setFormData({
      ...formData,
      cep: value
    });

    // Se o CEP tiver 8 dígitos (formato 00000-000 ou 00000000), busca o endereço
    if (value.replace(/\D/g, '').length === 8) {
      buscarEnderecoPorCEP(value);
    }
  };

  // Função para buscar o endereço a partir do CEP usando a API ViaCEP
  const buscarEnderecoPorCEP = async (cep: string) => {
    // Remove caracteres não numéricos do CEP
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return; // CEP incompleto, não faz a busca
    }
    
    try {
      // Mostra feedback visual de que está buscando o endereço
      setFormData(prev => ({
        ...prev,
        endereco: 'Buscando...',
        bairro: 'Buscando...',
        cidade: 'Buscando...',
        estado: 'Buscando...'
      }));
      
      // Faz a requisição para a API do ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }
      
      const data = await response.json();
      
      // Verifica se o CEP existe e não tem erro
      if (data.erro) {
        setErrors(prev => ({
          ...prev,
          cep: 'CEP não encontrado'
        }));
        
        // Limpa os campos de endereço
        setFormData(prev => ({
          ...prev,
          endereco: '',
          bairro: '',
          cidade: '',
          estado: ''
        }));
        
        return;
      }
      
      // Preenche os campos com os dados retornados pela API
      setFormData(prev => ({
        ...prev,
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      }));
      
      // Limpa o erro do CEP se existir
      if (errors.cep) {
        setErrors(prev => ({
          ...prev,
          cep: ''
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      
      // Limpa os campos de endereço em caso de erro
      setFormData(prev => ({
        ...prev,
        endereco: '',
        bairro: '',
        cidade: '',
        estado: ''
      }));
      
      setErrors(prev => ({
        ...prev,
        cep: 'Erro ao buscar CEP. Verifique se o CEP é válido.'
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.proprietarioId) {
      newErrors.proprietarioId = 'Proprietário é obrigatório';
    }
    
    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }
    
    if (!formData.numero.trim()) {
      newErrors.numero = 'Número é obrigatório';
    }
    
    if (!formData.bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
    }
    
    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }
    
    if (!formData.estado.trim()) {
      newErrors.estado = 'Estado é obrigatório';
    }
    
    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (!/^\d{5}-\d{3}$/.test(formData.cep)) {
      newErrors.cep = 'CEP deve estar no formato 00000-000';
    }
    
    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/imoveis/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao atualizar imóvel');
      }
      
      router.push('/imoveis');
      router.refresh();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert(error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar o imóvel. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Editar Imóvel</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="proprietarioId" className="block text-gray-800 font-medium mb-2">
              Proprietário
            </label>
            <select
              id="proprietarioId"
              name="proprietarioId"
              value={formData.proprietarioId}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 font-medium ${
                errors.proprietarioId ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
            >
              {proprietarios.map(proprietario => (
                <option key={proprietario.id} value={proprietario.id}>
                  {proprietario.nome} ({proprietario.cpf})
                </option>
              ))}
            </select>
            {errors.proprietarioId && <p className="text-red-500 text-sm mt-1">{errors.proprietarioId}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="cep" className="block text-gray-800 font-medium mb-2">
              CEP
            </label>
            <input
              type="text"
              id="cep"
              name="cep"
              value={formData.cep}
              onChange={formatCEP}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 font-medium ${
                errors.cep ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="00000-000"
              maxLength={9}
            />
            {errors.cep && <p className="text-red-500 text-sm mt-1">{errors.cep}</p>}
            <p className="text-xs text-gray-500 mt-1">Digite o CEP para preencher o endereço automaticamente</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="endereco" className="block text-gray-800 font-medium mb-2">
                Endereço
              </label>
              <input
                type="text"
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 font-medium ${
                  errors.endereco ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="Rua, Avenida, etc."
              />
              {errors.endereco && <p className="text-red-500 text-sm mt-1">{errors.endereco}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="numero" className="block text-gray-800 font-medium mb-2">
                Número
              </label>
              <input
                type="text"
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 font-medium ${
                  errors.numero ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="123"
              />
              {errors.numero && <p className="text-red-500 text-sm mt-1">{errors.numero}</p>}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="complemento" className="block text-gray-800 font-medium mb-2">
              Complemento <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              id="complemento"
              name="complemento"
              value={formData.complemento}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800 font-medium"
              placeholder="Apto, Bloco, etc."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="bairro" className="block text-gray-800 font-medium mb-2">
                Bairro
              </label>
              <input
                type="text"
                id="bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 font-medium ${
                  errors.bairro ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="Centro"
              />
              {errors.bairro && <p className="text-red-500 text-sm mt-1">{errors.bairro}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="cidade" className="block text-gray-800 font-medium mb-2">
                Cidade
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 font-medium ${
                  errors.cidade ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="São Paulo"
              />
              {errors.cidade && <p className="text-red-500 text-sm mt-1">{errors.cidade}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="estado" className="block text-gray-800 font-medium mb-2">
                Estado
              </label>
              <input
                type="text"
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 font-medium ${
                  errors.estado ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="SP"
                maxLength={2}
              />
              {errors.estado && <p className="text-red-500 text-sm mt-1">{errors.estado}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="tipo" className="block text-gray-800 font-medium mb-2">
                Tipo de Imóvel
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 font-medium ${
                  errors.tipo ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
              >
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
                <option value="outro">Outro</option>
              </select>
              {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
            </div>
          </div>
          

          
          <div className="mb-6">
            <label htmlFor="observacoes" className="block text-gray-800 font-medium mb-2">
              Observações <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800 font-medium"
              placeholder="Informações adicionais sobre o imóvel"
              rows={3}
            />
          </div>
          
          <div className="flex justify-between">
            <Link
              href="/imoveis"
              className="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400 transition duration-300"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
