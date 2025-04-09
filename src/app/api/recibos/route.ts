import { NextRequest, NextResponse } from 'next/server';
import { ReciboService } from '@/services/reciboService';
import { getUsuarioFromRequest } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inquilinoId = searchParams.get('inquilinoId');
    const imovelId = searchParams.get('imovelId');
    const proprietarioId = searchParams.get('proprietarioId');
    const mes = searchParams.get('mes');
    const ano = searchParams.get('ano');
    
    // Obter o usuário autenticado
    const usuario = await getUsuarioFromRequest(request);
    const usuarioId = usuario?.id;
    const isAdmin = usuario?.admin === true;
    
    let recibos;
    
    if (inquilinoId) {
      recibos = await ReciboService.getByInquilinoId(inquilinoId, usuarioId, isAdmin);
    } else if (imovelId) {
      recibos = await ReciboService.getByImovelId(imovelId, usuarioId, isAdmin);
    } else if (proprietarioId) {
      recibos = await ReciboService.getByProprietarioId(proprietarioId, usuarioId, isAdmin);
    } else if (mes && ano) {
      recibos = await ReciboService.getByMesAno(mes, ano, usuarioId, isAdmin);
    } else {
      recibos = await ReciboService.getAll(usuarioId, isAdmin);
    }
    
    return NextResponse.json(recibos);
  } catch (error) {
    console.error('Erro ao buscar recibos:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Obter o usuário autenticado
    const usuario = await getUsuarioFromRequest(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    // Validações básicas
    if (!data.inquilinoId || !data.imovelId || !data.proprietarioId || 
        !data.mesReferencia || !data.anoReferencia || 
        data.valorAluguel === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }
    
    try {
      const novoRecibo = await ReciboService.create({
        usuarioId: usuario.id,
        inquilinoId: data.inquilinoId,
        imovelId: data.imovelId,
        proprietarioId: data.proprietarioId,
        dataEmissao: data.dataEmissao || new Date().toISOString().split('T')[0],
        mesReferencia: data.mesReferencia,
        anoReferencia: data.anoReferencia,
        valorAluguel: Number(data.valorAluguel),
        valorAgua: Number(data.valorAgua || 0),
        valorLuz: Number(data.valorLuz || 0),
        valorIptu: Number(data.valorIptu || 0),
        valorJuros: Number(data.valorJuros || 0),
        valorTotal: 0, // Será calculado pelo serviço
        observacoes: data.observacoes,
        pago: data.pago || false,
        dataPagamento: data.dataPagamento
      });
      
      return NextResponse.json(novoRecibo, { status: 201 });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        return NextResponse.json(
          { error: serviceError.message },
          { status: 400 }
        );
      }
      throw serviceError;
    }
  } catch (error) {
    console.error('Erro ao criar recibo:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
