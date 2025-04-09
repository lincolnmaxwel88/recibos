import { NextRequest, NextResponse } from 'next/server';
import { ReciboService } from '@/services/reciboService';
import { getUsuarioFromRequest } from '@/utils/auth';

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
    if (!data.inquilinoId || !data.mesReferencia || !data.anoReferencia) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }
    
    try {
      // Extrair os novos campos do recibo
      const dadosAdicionais = {
        proximoReajuste: data.proximoReajuste || null,
        formaReajuste: data.formaReajuste || null,
        vencimentoContrato: data.vencimentoContrato || null,
        tipoAluguel: data.tipoAluguel || null,
        vencimento: data.vencimento || null,
        codigoLocatario: data.codigoLocatario || null,
        numeroRecibo: data.numeroRecibo || null,
        
        // Campos adicionais para valores específicos
        valorCorrMont: Number(data.valorCorrMont || 0),
        valorJuridico: Number(data.valorJuridico || 0),
        valorBonificacao: Number(data.valorBonificacao || 0),
        valorAbatimento: Number(data.valorAbatimento || 0),
        valorIRF: Number(data.valorIRF || 0)
      };
      
      const novoRecibo = await ReciboService.gerarNovoRecibo(
        data.inquilinoId,
        data.mesReferencia,
        data.anoReferencia,
        Number(data.valorAgua || 0),
        Number(data.valorLuz || 0),
        Number(data.valorIptu || 0),
        Number(data.valorJuros || 0),
        usuario.id,
        data.observacoes,
        dadosAdicionais // Passar os novos campos como um objeto
      );
      
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
    console.error('Erro ao gerar recibo:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
