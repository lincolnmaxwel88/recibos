export interface Plano {
  id: string;
  nome: string;
  descricao: string;
  limiteImoveis: number;
  limiteInquilinos: number;
  limiteProprietarios: number;
  permiteRelatoriosAvancados: boolean;
  permiteModelosPersonalizados: boolean;
  permiteMultiplosUsuarios: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PlanoId = 'basico' | 'profissional' | 'empresarial';
