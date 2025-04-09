import { NextRequest, NextResponse } from 'next/server';
import { InquilinoService } from '@/services/inquilinoService';
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
    
    const inquilino = await InquilinoService.getById(id, usuario.id, usuario.admin);
    
    if (!inquilino) {
      return NextResponse.json(
        { error: 'Inquilino não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(inquilino);
  } catch (error) {
    console.error('Erro ao buscar inquilino:', error);
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
    
    // Validações básicas
    if (!data.nome || !data.cpf || !data.telefone || !data.email || 
        !data.dataInicioContrato || data.valorAluguel === undefined || 
        data.diaVencimento === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }
    
    // Validação do dia de vencimento
    if (data.diaVencimento) {
      const diaVencimento = Number(data.diaVencimento);
      if (isNaN(diaVencimento) || diaVencimento < 1 || diaVencimento > 31) {
        return NextResponse.json(
          { error: 'Dia de vencimento deve ser um número entre 1 e 31' },
          { status: 400 }
        );
      }
    }
    
    // Validação do valor do aluguel
    if (data.valorAluguel) {
      const valorAluguel = Number(data.valorAluguel);
      if (isNaN(valorAluguel) || valorAluguel <= 0) {
        return NextResponse.json(
          { error: 'Valor do aluguel deve ser um número positivo' },
          { status: 400 }
        );
      }
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
      const inquilinoAtualizado = await InquilinoService.update(id, {
        imovelId: data.imovelId,
        nome: data.nome,
        cpf: data.cpf,
        telefone: data.telefone,
        email: data.email,
        dataInicioContrato: data.dataInicioContrato,
        dataFimContrato: data.dataFimContrato,
        valorAluguel: Number(data.valorAluguel),
        diaVencimento: Number(data.diaVencimento),
        ativo: data.ativo,
        observacoes: data.observacoes
      }, usuario.id, usuario.admin);
      
      return NextResponse.json(inquilinoAtualizado);
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Inquilino não encontrado' || 
            serviceError.message === 'Imóvel não encontrado') {
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
    console.error('Erro ao atualizar inquilino:', error);
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
      await InquilinoService.delete(id, usuario.id, usuario.admin);
      return NextResponse.json({ success: true });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Inquilino não encontrado') {
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
    console.error('Erro ao excluir inquilino:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
