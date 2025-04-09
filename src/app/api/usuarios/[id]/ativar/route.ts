import { NextRequest, NextResponse } from 'next/server';
import { UsuarioService } from '@/services/usuarioService';

// Ativar um usuário
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    try {
      const usuario = await UsuarioService.ativarUsuario(params.id);
      
      // Não retornar a senha
      const { senha, ...usuarioSemSenha } = usuario;
      
      return NextResponse.json({
        success: true,
        message: 'Usuário ativado com sucesso',
        usuario: usuarioSemSenha
      });
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
    console.error('Erro ao ativar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
