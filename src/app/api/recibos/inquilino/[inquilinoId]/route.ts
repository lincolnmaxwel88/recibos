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
    console.log('API: Buscando recibos para o inquilino:', inquilinoId);
    
    const recibos = await ReciboService.getByInquilinoId(inquilinoId);
    console.log('API: Recibos encontrados:', recibos.length);
    
    return NextResponse.json(recibos);
  } catch (error) {
    console.error('Erro ao buscar recibos do inquilino:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
