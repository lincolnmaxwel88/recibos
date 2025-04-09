import { db } from '@/db';
import { recibos } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { Recibo } from '@/types/recibo';
import { v4 as uuidv4 } from 'uuid';

// Função auxiliar para converter os tipos dos campos
function converterParaRecibo(item: Record<string, unknown>): Recibo {
  // Verificar se o item existe
  if (!item) return item;
  
  // Criar uma cópia do item
  const reciboConvertido = { ...item };
  
  // Converter o campo tipoAluguel apenas se ele existir
  if ('tipoAluguel' in item) {
    reciboConvertido.tipoAluguel = item.tipoAluguel as 'Residencial' | 'Comercial' | 'Comercial/Residencial' | null;
  }
  
  // Garantir que todos os novos campos existam, mesmo que sejam null
  reciboConvertido.proximoReajuste = item.proximoReajuste || null;
  reciboConvertido.formaReajuste = item.formaReajuste || null;
  reciboConvertido.vencimentoContrato = item.vencimentoContrato || null;
  reciboConvertido.vencimento = item.vencimento || null;
  reciboConvertido.codigoLocatario = item.codigoLocatario || null;
  reciboConvertido.numeroRecibo = item.numeroRecibo || null;
  
  // Garantir que os campos de valores adicionais existam
  reciboConvertido.valorCorrMont = item.valorCorrMont !== undefined ? Number(item.valorCorrMont) : 0;
  reciboConvertido.valorJuridico = item.valorJuridico !== undefined ? Number(item.valorJuridico) : 0;
  reciboConvertido.valorBonificacao = item.valorBonificacao !== undefined ? Number(item.valorBonificacao) : 0;
  reciboConvertido.valorAbatimento = item.valorAbatimento !== undefined ? Number(item.valorAbatimento) : 0;
  reciboConvertido.valorIRF = item.valorIRF !== undefined ? Number(item.valorIRF) : 0;
  
  return reciboConvertido;
}

export class ReciboRepository {
  async findAll(usuarioId?: string, isAdmin: boolean = false): Promise<Recibo[]> {
    let result;
    if (isAdmin) {
      // Administradores podem ver todos os registros
      result = await db.select().from(recibos);
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      result = await db.select().from(recibos).where(eq(recibos.usuarioId, usuarioId));
    } else {
      // Se não houver usuário autenticado, retorna lista vazia
      return [];
    }
    return result.map(converterParaRecibo);
  }

  async findByInquilinoId(inquilinoId: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo[]> {
    let result;
    if (isAdmin) {
      // Administradores podem ver todos os registros
      result = await db.select().from(recibos).where(eq(recibos.inquilinoId, inquilinoId));
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      result = await db.select().from(recibos).where(
        and(
          eq(recibos.inquilinoId, inquilinoId),
          eq(recibos.usuarioId, usuarioId)
        )
      );
    } else {
      // Se não houver usuário autenticado, retorna lista vazia
      return [];
    }
    return result.map(converterParaRecibo);
  }
  
  async findLastByInquilinoId(inquilinoId: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo | null> {
    console.log('Repository: Buscando último recibo para inquilino:', inquilinoId);
    
    try {
      let query;
      if (isAdmin) {
        // Administradores podem ver todos os registros
        query = eq(recibos.inquilinoId, inquilinoId);
      } else if (usuarioId) {
        // Usuários comuns só podem ver seus próprios registros
        query = and(
          eq(recibos.inquilinoId, inquilinoId),
          eq(recibos.usuarioId, usuarioId)
        );
      } else {
        // Se não houver usuário autenticado, retorna null
        return null;
      }
      
      const result = await db.select()
        .from(recibos)
        .where(query)
        .orderBy(sql`${recibos.createdAt} DESC`)
        .limit(1);
      
      console.log('Repository: Resultado da consulta:', result.length > 0 ? 'Recibo encontrado' : 'Nenhum recibo encontrado');
      
      if (result.length > 0) {
        const recibo = converterParaRecibo(result[0]);
        console.log('Repository: Recibo convertido:', recibo);
        return recibo;
      }
      
      return null;
    } catch (error) {
      console.error('Repository: Erro ao buscar último recibo:', error);
      throw error;
    }
  }

  async findByImovelId(imovelId: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo[]> {
    let result;
    if (isAdmin) {
      // Administradores podem ver todos os registros
      result = await db.select().from(recibos).where(eq(recibos.imovelId, imovelId));
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      result = await db.select().from(recibos).where(
        and(
          eq(recibos.imovelId, imovelId),
          eq(recibos.usuarioId, usuarioId)
        )
      );
    } else {
      // Se não houver usuário autenticado, retorna lista vazia
      return [];
    }
    return result.map(converterParaRecibo);
  }

  async findByProprietarioId(proprietarioId: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo[]> {
    let result;
    if (isAdmin) {
      // Administradores podem ver todos os registros
      result = await db.select().from(recibos).where(eq(recibos.proprietarioId, proprietarioId));
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      result = await db.select().from(recibos).where(
        and(
          eq(recibos.proprietarioId, proprietarioId),
          eq(recibos.usuarioId, usuarioId)
        )
      );
    } else {
      // Se não houver usuário autenticado, retorna lista vazia
      return [];
    }
    return result.map(converterParaRecibo);
  }

  async findByMesAno(mes: string, ano: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo[]> {
    let query;
    if (isAdmin) {
      // Administradores podem ver todos os registros
      query = and(
        eq(recibos.mesReferencia, mes),
        eq(recibos.anoReferencia, ano)
      );
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      query = and(
        eq(recibos.mesReferencia, mes),
        eq(recibos.anoReferencia, ano),
        eq(recibos.usuarioId, usuarioId)
      );
    } else {
      // Se não houver usuário autenticado, retorna lista vazia
      return [];
    }
    
    const result = await db.select()
      .from(recibos)
      .where(query);
    return result.map(converterParaRecibo);
  }

  async findByInquilinoIdAndPeriodo(inquilinoId: string, mes: string, ano: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo[]> {
    let query;
    if (isAdmin) {
      // Administradores podem ver todos os registros
      query = and(
        eq(recibos.inquilinoId, inquilinoId),
        eq(recibos.mesReferencia, mes),
        eq(recibos.anoReferencia, ano)
      );
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      query = and(
        eq(recibos.inquilinoId, inquilinoId),
        eq(recibos.mesReferencia, mes),
        eq(recibos.anoReferencia, ano),
        eq(recibos.usuarioId, usuarioId)
      );
    } else {
      // Se não houver usuário autenticado, retorna lista vazia
      return [];
    }
    
    const result = await db.select()
      .from(recibos)
      .where(query);
    return result.map(converterParaRecibo);
  }

  async findById(id: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo | null> {
    let query;
    if (isAdmin) {
      // Administradores podem ver qualquer registro
      query = eq(recibos.id, id);
    } else if (usuarioId) {
      // Usuários comuns só podem ver seus próprios registros
      query = and(eq(recibos.id, id), eq(recibos.usuarioId, usuarioId));
    } else {
      // Se não houver usuário autenticado, retorna null
      return null;
    }
    
    const result = await db.select().from(recibos).where(query);
    return result.length > 0 ? converterParaRecibo(result[0]) : null;
  }

  async create(data: Omit<Recibo, 'id' | 'createdAt' | 'updatedAt'> & { usuarioId: string }): Promise<Recibo> {
    const now = new Date();
    const novoRecibo: Recibo = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now
    };
    
    await db.insert(recibos).values({
      id: novoRecibo.id,
      usuarioId: novoRecibo.usuarioId,
      inquilinoId: novoRecibo.inquilinoId,
      imovelId: novoRecibo.imovelId,
      proprietarioId: novoRecibo.proprietarioId,
      dataEmissao: novoRecibo.dataEmissao,
      mesReferencia: novoRecibo.mesReferencia,
      anoReferencia: novoRecibo.anoReferencia,
      valorAluguel: novoRecibo.valorAluguel,
      valorAgua: novoRecibo.valorAgua,
      valorLuz: novoRecibo.valorLuz,
      valorIptu: novoRecibo.valorIptu,
      valorJuros: novoRecibo.valorJuros,
      valorTotal: novoRecibo.valorTotal,
      observacoes: novoRecibo.observacoes,
      pago: novoRecibo.pago,
      dataPagamento: novoRecibo.dataPagamento,
      // Novos campos do recibo
      proximoReajuste: novoRecibo.proximoReajuste,
      formaReajuste: novoRecibo.formaReajuste,
      vencimentoContrato: novoRecibo.vencimentoContrato,
      tipoAluguel: novoRecibo.tipoAluguel as 'Residencial' | 'Comercial' | 'Comercial/Residencial' | null,
      vencimento: novoRecibo.vencimento,
      codigoLocatario: novoRecibo.codigoLocatario,
      numeroRecibo: novoRecibo.numeroRecibo,
      // Campos de valores adicionais
      valorCorrMont: novoRecibo.valorCorrMont || 0,
      valorJuridico: novoRecibo.valorJuridico || 0,
      valorBonificacao: novoRecibo.valorBonificacao || 0,
      valorAbatimento: novoRecibo.valorAbatimento || 0,
      valorIRF: novoRecibo.valorIRF || 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
    
    return novoRecibo;
  }

  async update(id: string, data: Partial<Omit<Recibo, 'id' | 'createdAt' | 'updatedAt'>>, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo | null> {
    const recibo = await this.findById(id, usuarioId, isAdmin);
    if (!recibo) return null;
    
    const now = new Date();
    const updatedRecibo = {
      ...recibo,
      ...data,
      updatedAt: now
    };
    
    // Se tipoAluguel estiver presente nos dados de atualização, garantir que seja do tipo correto
    if (data.tipoAluguel) {
      updatedRecibo.tipoAluguel = data.tipoAluguel as 'Residencial' | 'Comercial' | 'Comercial/Residencial' | null;
    }
    
    await db.update(recibos)
      .set({
        inquilinoId: updatedRecibo.inquilinoId,
        imovelId: updatedRecibo.imovelId,
        proprietarioId: updatedRecibo.proprietarioId,
        dataEmissao: updatedRecibo.dataEmissao,
        mesReferencia: updatedRecibo.mesReferencia,
        anoReferencia: updatedRecibo.anoReferencia,
        valorAluguel: updatedRecibo.valorAluguel,
        valorAgua: updatedRecibo.valorAgua,
        valorLuz: updatedRecibo.valorLuz,
        valorIptu: updatedRecibo.valorIptu,
        valorJuros: updatedRecibo.valorJuros,
        valorTotal: updatedRecibo.valorTotal,
        observacoes: updatedRecibo.observacoes,
        pago: updatedRecibo.pago,
        dataPagamento: updatedRecibo.dataPagamento,
        // Novos campos do recibo
        proximoReajuste: updatedRecibo.proximoReajuste,
        formaReajuste: updatedRecibo.formaReajuste,
        vencimentoContrato: updatedRecibo.vencimentoContrato,
        tipoAluguel: updatedRecibo.tipoAluguel,
        vencimento: updatedRecibo.vencimento,
        codigoLocatario: updatedRecibo.codigoLocatario,
        numeroRecibo: updatedRecibo.numeroRecibo,
        // Campos de valores adicionais
        valorCorrMont: updatedRecibo.valorCorrMont,
        valorJuridico: updatedRecibo.valorJuridico,
        valorBonificacao: updatedRecibo.valorBonificacao,
        valorAbatimento: updatedRecibo.valorAbatimento,
        valorIRF: updatedRecibo.valorIRF,
        updatedAt: now.toISOString()
      })
      .where(eq(recibos.id, id));
    
    return converterParaRecibo(updatedRecibo);
  }

  async delete(id: string, usuarioId?: string, isAdmin: boolean = false): Promise<boolean> {
    const recibo = await this.findById(id, usuarioId, isAdmin);
    if (!recibo) return false;
    
    await db.delete(recibos).where(eq(recibos.id, id));
    return true;
  }
}
