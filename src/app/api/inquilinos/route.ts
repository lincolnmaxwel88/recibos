import { NextRequest, NextResponse } from 'next/server';
import { InquilinoService } from '@/services/inquilinoService';
import { getUsuarioFromRequest } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // Obter o usuário autenticado
    const usuario = await getUsuarioFromRequest(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const imovelId = searchParams.get('imovelId');
    const apenasAtivos = searchParams.get('ativos') === 'true';
    
    let inquilinos;
    if (imovelId) {
      inquilinos = await InquilinoService.getByImovelId(imovelId, usuario.id, usuario.admin);
    } else if (apenasAtivos) {
      inquilinos = await InquilinoService.getAtivos(usuario.id, usuario.admin);
    } else {
      inquilinos = await InquilinoService.getAll(usuario.id, usuario.admin);
    }
    
    return NextResponse.json(inquilinos);
  } catch (error) {
    console.error('Erro ao buscar inquilinos:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validações básicas
    if (!data.imovelId || !data.nome || !data.cpf || !data.telefone || 
        !data.email || !data.dataInicioContrato || 
        data.valorAluguel === undefined || data.diaVencimento === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }
    
    // Validação do dia de vencimento
    const diaVencimento = Number(data.diaVencimento);
    if (isNaN(diaVencimento) || diaVencimento < 1 || diaVencimento > 31) {
      return NextResponse.json(
        { error: 'Dia de vencimento deve ser um número entre 1 e 31' },
        { status: 400 }
      );
    }
    
    // Validação do valor do aluguel
    const valorAluguel = Number(data.valorAluguel);
    if (isNaN(valorAluguel) || valorAluguel <= 0) {
      return NextResponse.json(
        { error: 'Valor do aluguel deve ser um número positivo' },
        { status: 400 }
      );
    }
    
    // Obter o usuário autenticado
    const usuario = await getUsuarioFromRequest(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    try {
      const novoInquilino = await InquilinoService.create({
        imovelId: data.imovelId,
        nome: data.nome,
        cpf: data.cpf,
        telefone: data.telefone,
        email: data.email,
        dataInicioContrato: data.dataInicioContrato,
        dataFimContrato: data.dataFimContrato,
        valorAluguel: valorAluguel,
        diaVencimento: diaVencimento,
        ativo: data.ativo !== undefined ? data.ativo : true,
        observacoes: data.observacoes,
        usuarioId: usuario.id
      });
      
      return NextResponse.json(novoInquilino, { status: 201 });
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
    console.error('Erro ao criar inquilino:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
