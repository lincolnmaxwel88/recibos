import { NextRequest, NextResponse } from 'next/server';
import { UsuarioService } from '@/services/usuarioService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validações básicas
    if (!data.email || !data.senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }
    
    try {
      const resultado = await UsuarioService.login(data.email, data.senha);
      
      // Configurar o cookie com o token
      const response = NextResponse.json(resultado);
      response.cookies.set({
        name: 'auth_token',
        value: resultado.token,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 24 horas
        sameSite: 'strict'
      });
      
      return response;
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        return NextResponse.json(
          { error: serviceError.message },
          { status: 401 }
        );
      }
      throw serviceError;
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
