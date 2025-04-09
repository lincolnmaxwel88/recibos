export interface Proprietario {
  id: string;
  usuarioId: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
