export interface Imovel {
  id: string;
  usuarioId: string;
  proprietarioId: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  tipo: string;
  observacoes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
