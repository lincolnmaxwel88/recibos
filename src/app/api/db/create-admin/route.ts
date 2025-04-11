import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sql } from '@vercel/postgres';

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
    
    try {
      // Verificar se o email já está em uso
      const usuarioExistente = await sql`
        SELECT * FROM usuarios WHERE email = ${email}
      `;
      
      if (usuarioExistente.rows.length > 0) {
        return NextResponse.json(
          { error: 'Este email já está em uso' },
          { status: 400 }
        );
      }
      
      // Criar senha com hash
      const senhaHash = await hash(senha, 10);
      
      // Gerar ID único para o usuário
      const usuarioId = uuidv4();
      
      // Data atual em formato ISO
      const dataAtual = new Date().toISOString();
      
      // Inserir o usuário administrador
      await sql`
        INSERT INTO usuarios (
          id, nome, email, senha, planoId, ativo, admin, 
          trocarSenhaNoProximoLogin, createdAt, updatedAt
        ) VALUES (
          ${usuarioId}, ${nome}, ${email}, ${senhaHash}, 
          ${'empresarial'}, ${true}, ${true}, ${false}, 
          ${dataAtual}, ${dataAtual}
        )
      `;
      
      return NextResponse.json({
        message: 'Administrador criado com sucesso!',
        success: true,
        usuario: {
          id: usuarioId,
          nome,
          email,
          admin: true,
          ativo: true
        }
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      
      return NextResponse.json(
        { error: `Erro ao criar usuário: ${String(error)}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
    
    return NextResponse.json(
      { error: `Erro ao criar administrador: ${String(error)}` },
      { status: 500 }
    );
  }
}
