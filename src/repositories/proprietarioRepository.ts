import { db } from '@/db';
import { proprietarios } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { Proprietario } from '@/types/proprietario';
import { v4 as uuidv4 } from 'uuid';

export class ProprietarioRepository {
  async findAll(usuarioId?: string, isAdmin: boolean = false): Promise<Proprietario[]> {
    if (isAdmin) {
      // Administradores podem ver todos os registros
      return await db.select().from(proprietarios);
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      return await db.select().from(proprietarios).where(eq(proprietarios.usuarioId, usuarioId));
    } else {
      // Se não houver usuário autenticado, retorna lista vazia
      return [];
    }
  }

  async findById(id: string, usuarioId?: string, isAdmin: boolean = false): Promise<Proprietario | null> {
    let query;
    if (isAdmin) {
      // Administradores podem ver qualquer registro
      query = eq(proprietarios.id, id);
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      query = and(eq(proprietarios.id, id), eq(proprietarios.usuarioId, usuarioId));
    } else {
      // Se não houver usuário autenticado, retorna null
      return null;
    }
    
    const result = await db.select().from(proprietarios).where(query);
    return result.length > 0 ? result[0] : null;
  }

  async create(data: Omit<Proprietario, 'id' | 'createdAt' | 'updatedAt'> & { usuarioId: string }): Promise<Proprietario> {
    const now = new Date();
    const novoProprietario: Proprietario = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now
    };
    
    await db.insert(proprietarios).values({
      id: novoProprietario.id,
      usuarioId: novoProprietario.usuarioId,
      nome: novoProprietario.nome,
      cpf: novoProprietario.cpf,
      telefone: novoProprietario.telefone,
      email: novoProprietario.email,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
    
    return novoProprietario;
  }

  async update(id: string, data: Partial<Omit<Proprietario, 'id' | 'createdAt' | 'updatedAt'>>, usuarioId?: string, isAdmin: boolean = false): Promise<Proprietario | null> {
    const proprietario = await this.findById(id, usuarioId, isAdmin);
    if (!proprietario) return null;
    
    const now = new Date();
    const updatedProprietario = {
      ...proprietario,
      ...data,
      updatedAt: now
    };
    
    await db.update(proprietarios)
      .set({
        nome: updatedProprietario.nome,
        cpf: updatedProprietario.cpf,
        telefone: updatedProprietario.telefone,
        email: updatedProprietario.email,
        updatedAt: now.toISOString()
      })
      .where(eq(proprietarios.id, id));
    
    return updatedProprietario;
  }

  async delete(id: string, usuarioId?: string, isAdmin: boolean = false): Promise<boolean> {
    const proprietario = await this.findById(id, usuarioId, isAdmin);
    if (!proprietario) return false;
    
    await db.delete(proprietarios).where(eq(proprietarios.id, id));
    return true;
  }
}
