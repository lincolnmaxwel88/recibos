import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Limpar o cookie de autenticação
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: 0,
      sameSite: 'strict'
    });
    
    return response;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
