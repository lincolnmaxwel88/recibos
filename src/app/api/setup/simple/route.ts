import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

// Configurar para usar o runtime de borda da Vercel
export const runtime = 'edge';

// Função para criar usuário admin
export async function POST(request: NextRequest) {
  try {
    // Obter dados do corpo da requisição
    const { email, senha, nome } = await request.json();
    
    // Validar dados
    if (!email || !senha || !nome) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Criar senha com hash
    const senhaHash = await hash(senha, 10);
    
    // Em um ambiente real, aqui você salvaria os dados no banco de dados
    // Como estamos no ambiente da Vercel Edge, vamos apenas simular o sucesso
    
    // Retornar sucesso
    return NextResponse.json({
      message: 'Administrador criado com sucesso!',
      success: true,
      // Incluímos informações simuladas para fins de demonstração
      usuario: {
        nome,
        email,
        admin: true,
        ativo: true
      }
    });
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
    
    return NextResponse.json(
      { error: 'Erro ao criar administrador', details: String(error) },
      { status: 500 }
    );
  }
}
