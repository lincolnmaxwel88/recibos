import { NextRequest, NextResponse } from 'next/server';
import { ProprietarioService } from '@/services/proprietarioService';
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
    
    const proprietario = await ProprietarioService.getById(id, usuario.id, usuario.admin);
    
    if (!proprietario) {
      return NextResponse.json(
        { error: 'Proprietário não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(proprietario);
  } catch (error) {
    console.error('Erro ao buscar proprietário:', error);
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
    if (!data.nome || !data.cpf || !data.telefone || !data.email) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
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
      // Atualizar o proprietário, não precisamos passar usuarioId no objeto data
      // porque o método update já usa o usuarioId como parâmetro separado
      const proprietarioAtualizado = await ProprietarioService.update(id, {
        nome: data.nome,
        cpf: data.cpf,
        telefone: data.telefone,
        email: data.email
      }, usuario.id, usuario.admin);
      
      return NextResponse.json(proprietarioAtualizado);
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Proprietário não encontrado') {
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
    console.error('Erro ao atualizar proprietário:', error);
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
      await ProprietarioService.delete(id, usuario.id, usuario.admin);
      return NextResponse.json({ success: true });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Proprietário não encontrado') {
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
    console.error('Erro ao excluir proprietário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
