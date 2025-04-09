import { db } from '@/db';
import { inquilinos } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { Inquilino } from '@/types/inquilino';
import { v4 as uuidv4 } from 'uuid';

export class InquilinoRepository {
  async findAll(usuarioId?: string, isAdmin: boolean = false): Promise<Inquilino[]> {
    if (isAdmin) {
      // Administradores podem ver todos os registros
      return await db.select().from(inquilinos);
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      return await db.select().from(inquilinos).where(eq(inquilinos.usuarioId, usuarioId));
    } else {
      // Se não houver usuário autenticado, retorna lista vazia
      return [];
    }
  }

  async findByImovelId(imovelId: string, usuarioId?: string, isAdmin: boolean = false): Promise<Inquilino[]> {
    if (isAdmin) {
      // Administradores podem ver todos os registros
      return await db.select().from(inquilinos).where(eq(inquilinos.imovelId, imovelId));
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      return await db.select().from(inquilinos).where(
        and(
          eq(inquilinos.imovelId, imovelId),
          eq(inquilinos.usuarioId, usuarioId)
        )
      );
    } else {
      // Se não houver usuário autenticado, retorna lista vazia
      return [];
    }
  }

  async findAtivos(usuarioId?: string, isAdmin: boolean = false): Promise<Inquilino[]> {
    if (isAdmin) {
      // Administradores podem ver todos os registros
      return await db.select().from(inquilinos).where(eq(inquilinos.ativo, true));
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      return await db.select().from(inquilinos).where(
        and(
          eq(inquilinos.ativo, true),
          eq(inquilinos.usuarioId, usuarioId)
        )
      );
    } else {
      // Se não houver usuário autenticado, retorna lista vazia
      return [];
    }
  }

  async findAtivoByImovelId(imovelId: string, usuarioId?: string, isAdmin: boolean = false): Promise<Inquilino | null> {
    let query;
    if (isAdmin) {
      // Administradores podem ver todos os registros
      query = and(
        eq(inquilinos.imovelId, imovelId),
        eq(inquilinos.ativo, true)
      );
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      query = and(
        eq(inquilinos.imovelId, imovelId),
        eq(inquilinos.ativo, true),
        eq(inquilinos.usuarioId, usuarioId)
      );
    } else {
      // Se não houver usuário autenticado, retorna null
      return null;
    }
    
    const result = await db.select().from(inquilinos).where(query);
    return result.length > 0 ? result[0] : null;
  }

  async findById(id: string, usuarioId?: string, isAdmin: boolean = false): Promise<Inquilino | null> {
    let query;
    if (isAdmin) {
      // Administradores podem ver qualquer registro
      query = eq(inquilinos.id, id);
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      query = and(eq(inquilinos.id, id), eq(inquilinos.usuarioId, usuarioId));
    } else {
      // Se não houver usuário autenticado, retorna null
      return null;
    }
    
    const result = await db.select().from(inquilinos).where(query);
    return result.length > 0 ? result[0] : null;
  }

  async create(data: Omit<Inquilino, 'id' | 'createdAt' | 'updatedAt'> & { usuarioId: string }): Promise<Inquilino> {
    const now = new Date();
    const novoInquilino: Inquilino = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now
    };
    
    await db.insert(inquilinos).values({
      id: novoInquilino.id,
      usuarioId: novoInquilino.usuarioId,
      nome: novoInquilino.nome,
      cpf: novoInquilino.cpf,
      telefone: novoInquilino.telefone,
      email: novoInquilino.email,
      imovelId: novoInquilino.imovelId,
      dataInicioContrato: novoInquilino.dataInicioContrato,
      dataFimContrato: novoInquilino.dataFimContrato,
      valorAluguel: novoInquilino.valorAluguel,
      diaVencimento: novoInquilino.diaVencimento,
      ativo: novoInquilino.ativo,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
    
    return novoInquilino;
  }

  async update(id: string, data: Partial<Omit<Inquilino, 'id' | 'createdAt' | 'updatedAt'>>, usuarioId?: string, isAdmin: boolean = false): Promise<Inquilino | null> {
    const inquilino = await this.findById(id, usuarioId, isAdmin);
    if (!inquilino) return null;
    
    const now = new Date();
    const updatedInquilino = {
      ...inquilino,
      ...data,
      updatedAt: now
    };
    
    await db.update(inquilinos)
      .set({
        nome: updatedInquilino.nome,
        cpf: updatedInquilino.cpf,
        telefone: updatedInquilino.telefone,
        email: updatedInquilino.email,
        imovelId: updatedInquilino.imovelId,
        dataInicioContrato: updatedInquilino.dataInicioContrato,
        dataFimContrato: updatedInquilino.dataFimContrato,
        valorAluguel: updatedInquilino.valorAluguel,
        diaVencimento: updatedInquilino.diaVencimento,
        ativo: updatedInquilino.ativo,
        updatedAt: now.toISOString()
      })
      .where(eq(inquilinos.id, id));
    
    return updatedInquilino;
  }

  async delete(id: string, usuarioId?: string, isAdmin: boolean = false): Promise<boolean> {
    const inquilino = await this.findById(id, usuarioId, isAdmin);
    if (!inquilino) return false;
    
    await db.delete(inquilinos).where(eq(inquilinos.id, id));
    return true;
  }
}
