import { NextRequest } from 'next/server';
import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_aqui';

/**
 * Obtém o usuário a partir do token JWT na requisição
 */
export async function getUsuarioFromRequest(request: NextRequest) {
  try {
    // Obter o token do cookie ou do cabeçalho Authorization
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }
    
    // Verificar o token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    
    if (!payload.sub) {
      return null;
    }
    
    // Buscar o usuário no banco de dados
    const usuarioId = payload.sub as string;
    const usuariosEncontrados = await db.select()
      .from(usuarios)
      .where(eq(usuarios.id, usuarioId))
      .limit(1);
    
    if (!usuariosEncontrados || usuariosEncontrados.length === 0) {
      return null;
    }
    
    return usuariosEncontrados[0];
  } catch (error) {
    console.error('Erro ao obter usuário da requisição:', error);
    return null;
  }
}
