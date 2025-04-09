'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NovoProprietarioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
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
      const response = await fetch('/api/proprietarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao cadastrar proprietário');
      }
      
      router.push('/proprietarios');
      router.refresh();
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Ocorreu um erro ao cadastrar o proprietário. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Novo Proprietário</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nome" className="block text-gray-800 font-medium mb-2">
              Nome
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.nome ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              } text-gray-800 font-medium`}
              placeholder="Digite o nome completo"
            />
            {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="cpf" className="block text-gray-800 font-medium mb-2">
              CPF
            </label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={formatCPF}
              maxLength={14}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.cpf ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              } text-gray-800 font-medium`}
              placeholder="000.000.000-00"
            />
            {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="telefone" className="block text-gray-800 font-medium mb-2">
              Telefone
            </label>
            <input
              type="text"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={formatTelefone}
              maxLength={15}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.telefone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              } text-gray-800 font-medium`}
              placeholder="(00) 00000-0000"
            />
            {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
          </div>
          
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-800 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              } text-gray-800 font-medium`}
              placeholder="exemplo@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div className="flex justify-between">
            <Link
              href="/proprietarios"
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
