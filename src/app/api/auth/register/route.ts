import { NextRequest, NextResponse } from 'next/server';
import { UsuarioService } from '@/services/usuarioService';

export async function POST(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autorizado. Apenas administradores podem criar novos usuários.' },
        { status: 401 }
      );
    }
    
    // Validar o token
    const usuarioAutenticado = await UsuarioService.validateToken(token);
    
    if (!usuarioAutenticado) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado. Apenas administradores podem criar novos usuários.' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // Validações básicas
    if (!data.nome || !data.email || !data.senha) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }
    
    try {
      const novoUsuario = await UsuarioService.create({
        nome: data.nome,
        email: data.email,
        senha: data.senha
      });
      
      // Não retornar a senha
      const { senha: _, ...usuarioSemSenha } = novoUsuario;
      
      return NextResponse.json(usuarioSemSenha, { status: 201 });
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
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
