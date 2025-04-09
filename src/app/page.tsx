'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PlanoUtilizacao from '@/components/PlanoUtilizacao';
import { Plano } from '@/types/plano';

export default function Home() {
  const { usuario, loading } = useAuth();
  const router = useRouter();
  const [contagens, setContagens] = useState({
    proprietarios: 0,
    imoveis: 0,
    inquilinos: 0
  });
  const [planoAtual, setPlanoAtual] = useState<Plano | null>(null);

  // Redirecionar para a página de login se não estiver autenticado
  useEffect(() => {
    if (!loading && !usuario) {
      router.push('/login');
    }
  }, [loading, usuario, router]);

  // Buscar contagens reais do banco de dados e plano atual
  useEffect(() => {
    if (usuario) {
      buscarContagens();
      if (usuario.planoId) {
        buscarPlanoAtual(usuario.planoId);
      }
    }
  }, [usuario]);

  const buscarContagens = async () => {
    try {
      // Buscar proprietários
      const resProprietarios = await fetch('/api/proprietarios');
      const dataProprietarios = await resProprietarios.json();
      
      // Buscar imóveis
      const resImoveis = await fetch('/api/imoveis');
      const dataImoveis = await resImoveis.json();
      
      // Buscar inquilinos
      const resInquilinos = await fetch('/api/inquilinos');
      const dataInquilinos = await resInquilinos.json();
      
      setContagens({
        proprietarios: dataProprietarios.length || 0,
        imoveis: dataImoveis.length || 0,
        inquilinos: dataInquilinos.length || 0
      });
    } catch (error) {
      console.error('Erro ao buscar contagens:', error);
    }
  };
  
  const buscarPlanoAtual = async (planoId: string) => {
    try {
      // Usar a nova rota que não requer permissões de administrador
      const response = await fetch('/api/planos/usuario');
      if (response.ok) {
        const data = await response.json();
        setPlanoAtual(data);
      } else {
        console.error('Erro ao buscar plano:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
    }
  };

  // Mostrar um indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderizar nada (será redirecionado)
  if (!usuario) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Sistema de Gestão</h1>
          <p className="text-white">Bem-vindo(a), {usuario.nome}! Gerencie seus dados de forma simples e eficiente.</p>
        </div>
        
        <div className="p-8">
          {/* Componente de utilização do plano com dados estáticos */}
          <div className="max-w-4xl mx-auto">
            <PlanoUtilizacao 
              plano={planoAtual || {
                id: usuario?.planoId || 'basico',
                nome: usuario?.planoId === 'empresarial' ? 'Empresarial' : usuario?.planoId === 'profissional' ? 'Profissional' : 'Básico',
                descricao: 'Carregando...',
                limiteProprietarios: 0,
                limiteImoveis: 0,
                limiteInquilinos: 0,
                permiteRelatoriosAvancados: false,
                permiteModelosPersonalizados: false,
                permiteMultiplosUsuarios: false,
                createdAt: '',
                updatedAt: ''
              }}
              utilizacao={{
                proprietarios: {
                  atual: contagens.proprietarios,
                  limite: planoAtual?.limiteProprietarios || 0,
                  percentual: planoAtual ? Math.min(100, Math.round((contagens.proprietarios / planoAtual.limiteProprietarios) * 100)) : 0
                },
                imoveis: {
                  atual: contagens.imoveis,
                  limite: planoAtual?.limiteImoveis || 0,
                  percentual: planoAtual ? Math.min(100, Math.round((contagens.imoveis / planoAtual.limiteImoveis) * 100)) : 0
                },
                inquilinos: {
                  atual: contagens.inquilinos,
                  limite: planoAtual?.limiteInquilinos || 0,
                  percentual: planoAtual ? Math.min(100, Math.round((contagens.inquilinos / planoAtual.limiteInquilinos) * 100)) : 0
                },
                // Passar a flag de admin para o componente
                admin: usuario?.admin === true
              }}
            />
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300 text-sm">
            <p>Sistema de Gestão © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
