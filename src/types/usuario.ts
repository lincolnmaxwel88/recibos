import { PlanoId } from './plano';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  planoId: PlanoId;
  ativo: boolean;
  admin: boolean;
  trocarSenhaNoProximoLogin: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}
