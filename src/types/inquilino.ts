export interface Inquilino {
  id: string;
  usuarioId: string;
  imovelId: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  dataInicioContrato: string; // formato YYYY-MM-DD
  dataFimContrato?: string | null;   // formato YYYY-MM-DD (opcional)
  valorAluguel: number;
  diaVencimento: number;      // dia do mês para vencimento (1-31)
  ativo: boolean;
  observacoes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
