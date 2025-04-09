import { Imovel } from '@/types/imovel';
import { ImovelRepository } from '@/repositories/imovelRepository';

const imovelRepository = new ImovelRepository();

export const ImovelService = {
  getAll: async (usuarioId?: string, isAdmin: boolean = false): Promise<Imovel[]> => {
    return await imovelRepository.findAll(usuarioId, isAdmin);
  },

  getById: async (id: string, usuarioId?: string, isAdmin: boolean = false): Promise<Imovel | null> => {
    return await imovelRepository.findById(id, usuarioId, isAdmin);
  },

  getByProprietarioId: async (proprietarioId: string, usuarioId?: string, isAdmin: boolean = false): Promise<Imovel[]> => {
    return await imovelRepository.findByProprietarioId(proprietarioId, usuarioId, isAdmin);
  },

  create: async (data: Omit<Imovel, 'id' | 'createdAt' | 'updatedAt'> & { usuarioId: string }): Promise<Imovel> => {
    return await imovelRepository.create(data);
  },

  update: async (id: string, data: Omit<Partial<Imovel>, 'id' | 'createdAt' | 'updatedAt' | 'usuarioId'>, usuarioId?: string, isAdmin: boolean = false): Promise<Imovel | null> => {
    return await imovelRepository.update(id, data, usuarioId, isAdmin);
  },

  delete: async (id: string, usuarioId?: string, isAdmin: boolean = false): Promise<boolean> => {
    return await imovelRepository.delete(id, usuarioId, isAdmin);
  }
};
