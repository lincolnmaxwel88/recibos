import { NextRequest, NextResponse } from 'next/server';
import { ReciboService } from '@/services/reciboService';

interface Params {
  params: {
    inquilinoId: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { inquilinoId } = params;
    console.log('API: Buscando último recibo para o inquilino:', inquilinoId);
    
    const recibo = await ReciboService.getLastByInquilinoId(inquilinoId);
    console.log('API: Resultado da busca:', recibo ? 'Recibo encontrado' : 'Nenhum recibo encontrado');
    
    if (!recibo) {
      console.log('API: Retornando 404 - Nenhum recibo encontrado');
      return NextResponse.json(
        { error: 'Nenhum recibo encontrado para este inquilino' },
        { status: 404 }
      );
    }
    
    console.log('API: Retornando recibo encontrado');
    return NextResponse.json(recibo);
  } catch (error) {
    console.error('Erro ao buscar último recibo:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
