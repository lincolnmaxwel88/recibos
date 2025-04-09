import React from 'react';

interface RecursoUtilizacao {
  atual: number;
  limite: number;
  percentual: number;
}

interface PlanoUtilizacaoProps {
  plano: {
    id: string;
    nome: string;
    descricao: string;
    limiteProprietarios: number;
    limiteImoveis: number;
    limiteInquilinos: number;
    permiteRelatoriosAvancados: boolean;
    permiteModelosPersonalizados: boolean;
    permiteMultiplosUsuarios: boolean;
  };
  utilizacao: {
    proprietarios: RecursoUtilizacao;
    imoveis: RecursoUtilizacao;
    inquilinos: RecursoUtilizacao;
    admin?: boolean;
  };
}

export default function PlanoUtilizacao({ plano, utilizacao }: PlanoUtilizacaoProps) {
  // Verificar se o usuário é administrador
  const isAdmin = utilizacao.admin === true;

  const getBarColor = (percentual: number) => {
    if (percentual < 70) return 'bg-green-500';
    if (percentual < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
        <h2 className="text-xl font-bold text-white mb-1">Seu Plano: {isAdmin ? 'Administrador' : plano.nome}</h2>
        <p className="text-blue-100">{isAdmin ? 'Acesso ilimitado a todos os recursos' : plano.descricao}</p>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Utilização de Recursos</h3>
        
        <div className="space-y-6">
          {/* Proprietários */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Proprietários</span>
              <span className="text-gray-700 dark:text-gray-300">
                {utilizacao.proprietarios.atual} / {isAdmin ? '∞' : utilizacao.proprietarios.limite}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${isAdmin ? 'bg-green-500' : getBarColor(utilizacao.proprietarios.percentual)}`} 
                style={{ width: isAdmin ? '10%' : `${utilizacao.proprietarios.percentual}%` }}
              ></div>
            </div>
          </div>
          
          {/* Imóveis */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Imóveis</span>
              <span className="text-gray-700 dark:text-gray-300">
                {utilizacao.imoveis.atual} / {isAdmin ? '∞' : utilizacao.imoveis.limite}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${isAdmin ? 'bg-green-500' : getBarColor(utilizacao.imoveis.percentual)}`} 
                style={{ width: isAdmin ? '10%' : `${utilizacao.imoveis.percentual}%` }}
              ></div>
            </div>
          </div>
          
          {/* Inquilinos */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Inquilinos</span>
              <span className="text-gray-700 dark:text-gray-300">
                {utilizacao.inquilinos.atual} / {isAdmin ? '∞' : utilizacao.inquilinos.limite}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${isAdmin ? 'bg-green-500' : getBarColor(utilizacao.inquilinos.percentual)}`} 
                style={{ width: isAdmin ? '10%' : `${utilizacao.inquilinos.percentual}%` }}
              ></div>
            </div>
          </div>
        </div>
        

      </div>
    </div>
  );
}
