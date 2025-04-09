import { NextRequest, NextResponse } from 'next/server';
import { ImovelService } from '@/services/imovelService';
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
    const proprietarioId = searchParams.get('proprietarioId');
    
    let imoveis;
    if (proprietarioId) {
      imoveis = await ImovelService.getByProprietarioId(proprietarioId, usuario.id, usuario.admin);
    } else {
      imoveis = await ImovelService.getAll(usuario.id, usuario.admin);
    }
    
    return NextResponse.json(imoveis);
  } catch (error) {
    console.error('Erro ao buscar imóveis:', error);
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
    if (!data.proprietarioId || !data.endereco || !data.numero || !data.bairro || 
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
      const novoImovel = await ImovelService.create({
        proprietarioId: data.proprietarioId,
        endereco: data.endereco,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        tipo: data.tipo,
        observacoes: data.observacoes,
        usuarioId: usuario.id
      });
      
      return NextResponse.json(novoImovel, { status: 201 });
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
    console.error('Erro ao criar imóvel:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
