import { db } from '@/db';
import { imoveis } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { Imovel } from '@/types/imovel';
import { v4 as uuidv4 } from 'uuid';

export class ImovelRepository {
  async findAll(usuarioId?: string, isAdmin: boolean = false): Promise<Imovel[]> {
    if (isAdmin) {
      // Administradores podem ver todos os registros
      return await db.select().from(imoveis);
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      return await db.select().from(imoveis).where(eq(imoveis.usuarioId, usuarioId));
    } else {
      // Se não houver usuário autenticado, retorna lista vazia
      return [];
    }
  }

  async findByProprietarioId(proprietarioId: string, usuarioId?: string, isAdmin: boolean = false): Promise<Imovel[]> {
    if (isAdmin) {
      // Administradores podem ver todos os registros
      return await db.select().from(imoveis).where(eq(imoveis.proprietarioId, proprietarioId));
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      return await db.select().from(imoveis).where(
        and(
          eq(imoveis.proprietarioId, proprietarioId),
          eq(imoveis.usuarioId, usuarioId)
        )
      );
    } else {
      // Se não houver usuário autenticado, retorna lista vazia
      return [];
    }
  }

  async findById(id: string, usuarioId?: string, isAdmin: boolean = false): Promise<Imovel | null> {
    let query;
    if (isAdmin) {
      // Administradores podem ver qualquer registro
      query = eq(imoveis.id, id);
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      query = and(eq(imoveis.id, id), eq(imoveis.usuarioId, usuarioId));
    } else {
      // Se não houver usuário autenticado, retorna null
      return null;
    }
    
    const result = await db.select().from(imoveis).where(query);
    return result.length > 0 ? result[0] : null;
  }

  async create(data: Omit<Imovel, 'id' | 'createdAt' | 'updatedAt'> & { usuarioId: string }): Promise<Imovel> {
    const now = new Date();
    const novoImovel: Imovel = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now
    };
    
    await db.insert(imoveis).values({
      id: novoImovel.id,
      usuarioId: novoImovel.usuarioId,
      proprietarioId: novoImovel.proprietarioId,
      endereco: novoImovel.endereco,
      numero: novoImovel.numero,
      complemento: novoImovel.complemento,
      bairro: novoImovel.bairro,
      cidade: novoImovel.cidade,
      estado: novoImovel.estado,
      cep: novoImovel.cep,
      tipo: novoImovel.tipo,
      observacoes: novoImovel.observacoes,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
    
    return novoImovel;
  }

  async update(id: string, data: Partial<Omit<Imovel, 'id' | 'createdAt' | 'updatedAt'>>, usuarioId?: string, isAdmin: boolean = false): Promise<Imovel | null> {
    const imovel = await this.findById(id, usuarioId, isAdmin);
    if (!imovel) return null;
    
    const now = new Date();
    const updatedImovel = {
      ...imovel,
      ...data,
      updatedAt: now
    };
    
    await db.update(imoveis)
      .set({
        proprietarioId: updatedImovel.proprietarioId,
        endereco: updatedImovel.endereco,
        numero: updatedImovel.numero,
        complemento: updatedImovel.complemento,
        bairro: updatedImovel.bairro,
        cidade: updatedImovel.cidade,
        estado: updatedImovel.estado,
        cep: updatedImovel.cep,
        tipo: updatedImovel.tipo,
        observacoes: updatedImovel.observacoes,
        updatedAt: now.toISOString()
      })
      .where(eq(imoveis.id, id));
    
    return updatedImovel;
  }

  async delete(id: string, usuarioId?: string, isAdmin: boolean = false): Promise<boolean> {
    const imovel = await this.findById(id, usuarioId, isAdmin);
    if (!imovel) return false;
    
    await db.delete(imoveis).where(eq(imoveis.id, id));
    return true;
  }
}
