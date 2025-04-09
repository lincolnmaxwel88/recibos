import { Inquilino } from '@/types/inquilino';
import { InquilinoRepository } from '@/repositories/inquilinoRepository';

const inquilinoRepository = new InquilinoRepository();

export const InquilinoService = {
  getAll: async (usuarioId?: string, isAdmin: boolean = false): Promise<Inquilino[]> => {
    return await inquilinoRepository.findAll(usuarioId, isAdmin);
  },

  getById: async (id: string, usuarioId?: string, isAdmin: boolean = false): Promise<Inquilino | null> => {
    return await inquilinoRepository.findById(id, usuarioId, isAdmin);
  },

  getByImovelId: async (imovelId: string, usuarioId?: string, isAdmin: boolean = false): Promise<Inquilino[]> => {
    return await inquilinoRepository.findByImovelId(imovelId, usuarioId, isAdmin);
  },

  getAtivos: async (usuarioId?: string, isAdmin: boolean = false): Promise<Inquilino[]> => {
    return await inquilinoRepository.findAtivos(usuarioId, isAdmin);
  },

  create: async (data: Omit<Inquilino, 'id' | 'createdAt' | 'updatedAt'> & { usuarioId: string }): Promise<Inquilino> => {
    // Verificar se já existe um inquilino ativo para este imóvel
    const inquilinoAtivo = await inquilinoRepository.findAtivoByImovelId(data.imovelId, data.usuarioId);
    if (inquilinoAtivo && data.ativo) {
      throw new Error('Este imóvel já possui um inquilino ativo');
    }

    return await inquilinoRepository.create(data);
  },

  update: async (id: string, data: Omit<Partial<Inquilino>, 'id' | 'createdAt' | 'updatedAt' | 'usuarioId'>, usuarioId?: string, isAdmin: boolean = false): Promise<Inquilino | null> => {
    const inquilino = await inquilinoRepository.findById(id, usuarioId, isAdmin);
    if (!inquilino) {
      throw new Error('Inquilino não encontrado');
    }

    // Se o imovelId for alterado, verificar se já existe um inquilino ativo para este imóvel
    if (data.imovelId && data.imovelId !== inquilino.imovelId) {
      const inquilinoAtivo = await inquilinoRepository.findAtivoByImovelId(data.imovelId, usuarioId);
      
      if (inquilinoAtivo && (data.ativo === true || (data.ativo === undefined && inquilino.ativo))) {
        throw new Error('Este imóvel já possui um inquilino ativo');
      }
    }

    return await inquilinoRepository.update(id, data, usuarioId, isAdmin);
  },

  delete: async (id: string, usuarioId?: string, isAdmin: boolean = false): Promise<boolean> => {
    const inquilino = await inquilinoRepository.findById(id, usuarioId, isAdmin);
    if (!inquilino) {
      throw new Error('Inquilino não encontrado');
    }

    return await inquilinoRepository.delete(id, usuarioId, isAdmin);
  }
};
