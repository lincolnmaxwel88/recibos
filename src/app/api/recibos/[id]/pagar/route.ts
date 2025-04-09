import { NextRequest, NextResponse } from 'next/server';
import { ReciboService } from '@/services/reciboService';
import { getUsuarioFromRequest } from '@/utils/auth';

interface Params {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: Params) {
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
    
    if (!data.dataPagamento) {
      return NextResponse.json(
        { error: 'A data de pagamento é obrigatória' },
        { status: 400 }
      );
    }
    
    try {
      const reciboPago = await ReciboService.marcarComoPago(id, data.dataPagamento, usuario.id, usuario.admin === true);
      return NextResponse.json(reciboPago);
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
    console.error('Erro ao marcar recibo como pago:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
