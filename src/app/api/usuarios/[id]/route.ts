import { NextRequest, NextResponse } from 'next/server';
import { UsuarioService } from '@/services/usuarioService';

// Obter um usuário específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await UsuarioService.getById(params.id);
    
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    // Não retornar a senha
    const { senha, ...usuarioSemSenha } = usuario;
    
    return NextResponse.json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

// Atualizar um usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    // Validações básicas
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum dado fornecido para atualização' },
        { status: 400 }
      );
    }
    
    try {
      const usuarioAtualizado = await UsuarioService.update(params.id, data);
      
      // Não retornar a senha
      const { senha, ...usuarioSemSenha } = usuarioAtualizado;
      
      return NextResponse.json(usuarioSemSenha);
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
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

// Atualizar parcialmente um usuário
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    // Validações básicas
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum dado fornecido para atualização' },
        { status: 400 }
      );
    }
    
    try {
      const usuarioAtualizado = await UsuarioService.update(params.id, data);
      
      // Não retornar a senha
      const { senha, ...usuarioSemSenha } = usuarioAtualizado;
      
      return NextResponse.json(usuarioSemSenha);
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
    console.error('Erro ao atualizar parcialmente usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

// Excluir um usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    try {
      await UsuarioService.delete(params.id);
      
      return NextResponse.json(
        { success: true, message: 'Usuário excluído com sucesso' }
      );
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
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
