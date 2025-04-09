import { Proprietario } from '@/types/proprietario';
import { ProprietarioRepository } from '@/repositories/proprietarioRepository';

const proprietarioRepository = new ProprietarioRepository();

export const ProprietarioService = {
  getAll: async (usuarioId?: string, isAdmin: boolean = false) => {
    return await proprietarioRepository.findAll(usuarioId, isAdmin);
  },

  getById: async (id: string, usuarioId?: string, isAdmin: boolean = false) => {
    return await proprietarioRepository.findById(id, usuarioId, isAdmin);
  },

  create: async (data: Omit<Proprietario, 'id' | 'createdAt' | 'updatedAt'> & { usuarioId: string }) => {
    // Verificar se já existe um proprietário com o mesmo CPF para este usuário
    const proprietarios = await proprietarioRepository.findAll(data.usuarioId);
    const cpfExists = proprietarios.some(p => p.cpf === data.cpf);
    if (cpfExists) {
      throw new Error('Já existe um proprietário com este CPF');
    }

    return await proprietarioRepository.create(data);
  },

  update: async (id: string, data: Omit<Proprietario, 'id' | 'createdAt' | 'updatedAt' | 'usuarioId'>, usuarioId?: string, isAdmin: boolean = false) => {
    const proprietario = await proprietarioRepository.findById(id, usuarioId, isAdmin);
    if (!proprietario) {
      throw new Error('Proprietário não encontrado');
    }

    // Verificar se já existe outro proprietário com o mesmo CPF para este usuário
    const proprietarios = await proprietarioRepository.findAll(usuarioId, isAdmin);
    const cpfExists = proprietarios.some(p => p.cpf === data.cpf && p.id !== id);
    if (cpfExists) {
      throw new Error('Já existe outro proprietário com este CPF');
    }

    return await proprietarioRepository.update(id, data, usuarioId, isAdmin);
  },

  delete: async (id: string, usuarioId?: string, isAdmin: boolean = false) => {
    const proprietario = await proprietarioRepository.findById(id, usuarioId, isAdmin);
    if (!proprietario) {
      throw new Error('Proprietário não encontrado');
    }

    return await proprietarioRepository.delete(id, usuarioId, isAdmin);
  }
};
