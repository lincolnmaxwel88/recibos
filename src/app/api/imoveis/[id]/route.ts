import { NextRequest, NextResponse } from 'next/server';
import { ImovelService } from '@/services/imovelService';
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
    
    const imovel = await ImovelService.getById(id, usuario.id, usuario.admin);
    
    if (!imovel) {
      return NextResponse.json(
        { error: 'Imóvel não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(imovel);
  } catch (error) {
    console.error('Erro ao buscar imóvel:', error);
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
    if (!data.endereco || !data.numero || !data.bairro || 
        !data.cidade || !data.estado || !data.cep || !data.tipo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
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
      const imovelAtualizado = await ImovelService.update(id, {
        proprietarioId: data.proprietarioId,
        endereco: data.endereco,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        tipo: data.tipo,
        observacoes: data.observacoes
      }, usuario.id, usuario.admin);
      
      return NextResponse.json(imovelAtualizado);
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Imóvel não encontrado' || 
            serviceError.message === 'Proprietário não encontrado') {
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
    console.error('Erro ao atualizar imóvel:', error);
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
      await ImovelService.delete(id, usuario.id, usuario.admin);
      return NextResponse.json({ success: true });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Imóvel não encontrado') {
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
    console.error('Erro ao excluir imóvel:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
