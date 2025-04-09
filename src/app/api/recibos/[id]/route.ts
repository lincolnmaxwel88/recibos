import { NextRequest, NextResponse } from 'next/server';
import { ReciboService } from '@/services/reciboService';
import { getUsuarioFromRequest } from '@/utils/auth';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Obter o usuário autenticado
    const usuario = await getUsuarioFromRequest(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    const recibo = await ReciboService.getById(id, usuario.id, usuario.admin === true);
    
    if (!recibo) {
      return NextResponse.json(
        { error: 'Recibo não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(recibo);
  } catch (error) {
    console.error('Erro ao buscar recibo:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Obter o usuário autenticado
    const usuario = await getUsuarioFromRequest(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    try {
      const reciboAtualizado = await ReciboService.update(id, {
        inquilinoId: data.inquilinoId,
        imovelId: data.imovelId,
        proprietarioId: data.proprietarioId,
        dataEmissao: data.dataEmissao,
        mesReferencia: data.mesReferencia,
        anoReferencia: data.anoReferencia,
        valorAluguel: data.valorAluguel !== undefined ? Number(data.valorAluguel) : undefined,
        valorAgua: data.valorAgua !== undefined ? Number(data.valorAgua) : undefined,
        valorLuz: data.valorLuz !== undefined ? Number(data.valorLuz) : undefined,
        valorIptu: data.valorIptu !== undefined ? Number(data.valorIptu) : undefined,
        valorJuros: data.valorJuros !== undefined ? Number(data.valorJuros) : undefined,
        observacoes: data.observacoes,
        pago: data.pago,
        dataPagamento: data.dataPagamento
      }, usuario.id, usuario.admin === true);
      
      return NextResponse.json(reciboAtualizado);
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Recibo não encontrado') {
          return NextResponse.json(
            { error: serviceError.message },
            { status: 404 }
          );
        }
        return NextResponse.json(
          { error: serviceError.message },
          { status: 400 }
        );
      }
      throw serviceError;
    }
  } catch (error) {
    console.error('Erro ao atualizar recibo:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Obter o usuário autenticado
    const usuario = await getUsuarioFromRequest(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    try {
      await ReciboService.delete(id, usuario.id, usuario.admin === true);
      return NextResponse.json({ success: true });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Recibo não encontrado') {
          return NextResponse.json(
            { error: serviceError.message },
            { status: 404 }
          );
        }
        return NextResponse.json(
          { error: serviceError.message },
          { status: 400 }
        );
      }
      throw serviceError;
    }
  } catch (error) {
    console.error('Erro ao excluir recibo:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
