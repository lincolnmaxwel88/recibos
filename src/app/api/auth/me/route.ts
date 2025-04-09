import { NextRequest, NextResponse } from 'next/server';
import { UsuarioService } from '@/services/usuarioService';

export async function GET(request: NextRequest) {
  try {
    // Obter o token do cookie
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    // Validar o token
    const usuario = await UsuarioService.validateToken(token);
    
    if (!usuario) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }
    
    // Garantir que o campo trocarSenhaNoProximoLogin esteja presente na resposta
    // Isso é importante para o redirecionamento na página de troca de senha
    console.log('Dados do usuário na API /me:', {
      ...usuario,
      trocarSenhaNoProximoLogin: usuario.trocarSenhaNoProximoLogin
    });
    
    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
