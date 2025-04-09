import { Recibo } from '@/types/recibo';
import { ReciboRepository } from '@/repositories/reciboRepository';
import { InquilinoService } from './inquilinoService';
import { ImovelService } from './imovelService';
import { ProprietarioService } from './proprietarioService';

const reciboRepository = new ReciboRepository();

export const ReciboService = {
  getAll: async (usuarioId?: string, isAdmin: boolean = false): Promise<Recibo[]> => {
    return await reciboRepository.findAll(usuarioId, isAdmin);
  },

  getById: async (id: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo | null> => {
    return await reciboRepository.findById(id, usuarioId, isAdmin);
  },

  getByInquilinoId: async (inquilinoId: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo[]> => {
    return await reciboRepository.findByInquilinoId(inquilinoId, usuarioId, isAdmin);
  },

  getLastByInquilinoId: async (inquilinoId: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo | null> => {
    return await reciboRepository.findLastByInquilinoId(inquilinoId, usuarioId, isAdmin);
  },

  getByImovelId: async (imovelId: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo[]> => {
    return await reciboRepository.findByImovelId(imovelId, usuarioId, isAdmin);
  },

  getByProprietarioId: async (proprietarioId: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo[]> => {
    return await reciboRepository.findByProprietarioId(proprietarioId, usuarioId, isAdmin);
  },

  getByMesAno: async (mes: string, ano: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo[]> => {
    return await reciboRepository.findByMesAno(mes, ano, usuarioId, isAdmin);
  },

  create: async (data: Omit<Recibo, 'id' | 'createdAt' | 'updatedAt'> & { usuarioId: string }): Promise<Recibo> => {
    // Verificar se o inquilino existe
    const inquilino = await InquilinoService.getById(data.inquilinoId);
    if (!inquilino) {
      throw new Error('Inquilino não encontrado');
    }

    // Verificar se o imóvel existe
    const imovel = await ImovelService.getById(data.imovelId);
    if (!imovel) {
      throw new Error('Imóvel não encontrado');
    }

    // Verificar se o proprietário existe
    const proprietario = await ProprietarioService.getById(data.proprietarioId);
    if (!proprietario) {
      throw new Error('Proprietário não encontrado');
    }

    // Calcular o valor total
    const valorTotal = 
      data.valorAluguel + 
      data.valorAgua + 
      data.valorLuz + 
      data.valorIptu + 
      data.valorJuros;

    // Criar o recibo com o valor total calculado
    return await reciboRepository.create({
      ...data,
      valorTotal
    });
  },

  update: async (id: string, data: Omit<Partial<Recibo>, 'id' | 'createdAt' | 'updatedAt'>, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo> => {
    // Buscar o recibo atual
    const reciboAtual = await reciboRepository.findById(id, usuarioId, isAdmin);
    if (!reciboAtual) {
      throw new Error('Recibo não encontrado');
    }

    // Recalcular o valor total se algum dos valores for alterado
    let valorTotal = reciboAtual.valorTotal;
    if (
      data.valorAluguel !== undefined || 
      data.valorAgua !== undefined || 
      data.valorLuz !== undefined || 
      data.valorIptu !== undefined || 
      data.valorJuros !== undefined
    ) {
      valorTotal = 
        (data.valorAluguel !== undefined ? data.valorAluguel : reciboAtual.valorAluguel) +
        (data.valorAgua !== undefined ? data.valorAgua : reciboAtual.valorAgua) +
        (data.valorLuz !== undefined ? data.valorLuz : reciboAtual.valorLuz) +
        (data.valorIptu !== undefined ? data.valorIptu : reciboAtual.valorIptu) +
        (data.valorJuros !== undefined ? data.valorJuros : reciboAtual.valorJuros);
    }

    // Atualizar o recibo com os novos dados e valor total recalculado
    const reciboAtualizado = await reciboRepository.update(id, {
      ...data,
      valorTotal
    }, usuarioId, isAdmin);
    
    if (!reciboAtualizado) {
      throw new Error('Falha ao atualizar o recibo');
    }
    
    return reciboAtualizado;
  },

  delete: async (id: string, usuarioId?: string, isAdmin: boolean = false): Promise<boolean> => {
    const recibo = await reciboRepository.findById(id, usuarioId, isAdmin);
    if (!recibo) {
      throw new Error('Recibo não encontrado');
    }

    return await reciboRepository.delete(id, usuarioId, isAdmin);
  },

  marcarComoPago: async (id: string, dataPagamento: string, usuarioId?: string, isAdmin: boolean = false): Promise<Recibo> => {
    const recibo = await reciboRepository.findById(id, usuarioId, isAdmin);
    if (!recibo) {
      throw new Error('Recibo não encontrado');
    }

    const reciboAtualizado = await reciboRepository.update(id, {
      pago: true,
      dataPagamento
    }, usuarioId, isAdmin);
    
    if (!reciboAtualizado) {
      throw new Error('Falha ao marcar o recibo como pago');
    }
    
    return reciboAtualizado;
  },

  // Método para gerar um novo recibo com base nos dados do inquilino
  gerarNovoRecibo: async (inquilinoId: string, mesReferencia: string, anoReferencia: string, 
    valorAgua: number, valorLuz: number, valorIptu: number, valorJuros: number, usuarioId: string, observacoes?: string,
    dadosAdicionais?: {
      proximoReajuste?: string | null;
      formaReajuste?: string | null;
      vencimentoContrato?: string | null;
      tipoAluguel?: 'Comercial' | 'Residencial' | 'Comercial/Residencial' | null;
      vencimento?: string | null;
      codigoLocatario?: string | null;
      numeroRecibo?: string | null;
      valorCorrMont?: number | null;
      valorJuridico?: number | null;
      valorBonificacao?: number | null;
      valorAbatimento?: number | null;
      valorIRF?: number | null;
    }): Promise<Recibo> => {
    
    // Buscar inquilino
    const inquilino = await InquilinoService.getById(inquilinoId);
    if (!inquilino) {
      throw new Error('Inquilino não encontrado');
    }

    // Buscar imóvel
    const imovel = await ImovelService.getById(inquilino.imovelId);
    if (!imovel) {
      throw new Error('Imóvel não encontrado');
    }

    // Buscar proprietário
    const proprietario = await ProprietarioService.getById(imovel.proprietarioId);
    if (!proprietario) {
      throw new Error('Proprietário não encontrado');
    }

    // Verificar se já existe um recibo para este inquilino neste mês/ano
    const recibosExistentes = await reciboRepository.findByInquilinoIdAndPeriodo(
      inquilinoId, 
      mesReferencia, 
      anoReferencia,
      usuarioId,
      false // Não é admin por padrão, pois queremos verificar apenas os recibos deste usuário
    );

    if (recibosExistentes.length > 0) {
      throw new Error(`Já existe um recibo para ${inquilino.nome} referente a ${mesReferencia}/${anoReferencia}`);
    }

    // Criar novo recibo
    const dataAtual = new Date().toISOString().split('T')[0];
    
    // Obter valores adicionais
    const valorCorrMont = dadosAdicionais?.valorCorrMont || 0;
    const valorJuridico = dadosAdicionais?.valorJuridico || 0;
    const valorBonificacao = dadosAdicionais?.valorBonificacao || 0;
    const valorAbatimento = dadosAdicionais?.valorAbatimento || 0;
    const valorIRF = dadosAdicionais?.valorIRF || 0;
    
    // Calcular valor total incluindo os novos campos
    const valorTotal = inquilino.valorAluguel + valorAgua + valorLuz + valorIptu + valorJuros + 
                       valorCorrMont + valorJuridico - valorBonificacao - valorAbatimento - valorIRF;

    return await reciboRepository.create({
      usuarioId,
      inquilinoId,
      imovelId: imovel.id,
      proprietarioId: proprietario.id,
      dataEmissao: dataAtual,
      mesReferencia,
      anoReferencia,
      valorAluguel: inquilino.valorAluguel,
      valorAgua,
      valorLuz,
      valorIptu,
      valorJuros,
      valorTotal,
      observacoes,
      pago: false,
      // Novos campos do recibo
      proximoReajuste: dadosAdicionais?.proximoReajuste || null,
      formaReajuste: dadosAdicionais?.formaReajuste || null,
      vencimentoContrato: dadosAdicionais?.vencimentoContrato || null,
      tipoAluguel: dadosAdicionais?.tipoAluguel || null,
      vencimento: dadosAdicionais?.vencimento || null,
      codigoLocatario: dadosAdicionais?.codigoLocatario || null,
      numeroRecibo: dadosAdicionais?.numeroRecibo || null,
      
      // Campos adicionais para valores específicos
      valorCorrMont: valorCorrMont,
      valorJuridico: valorJuridico,
      valorBonificacao: valorBonificacao,
      valorAbatimento: valorAbatimento,
      valorIRF: valorIRF
    });
  }
};
