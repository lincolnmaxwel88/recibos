import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { planos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUsuarioFromRequest } from '@/utils/auth';

// Obter o plano do usuário atual
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const usuario = await getUsuarioFromRequest(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Buscar o plano do usuário
    if (!usuario.planoId) {
      return NextResponse.json(
        { error: 'Usuário não possui plano associado' },
        { status: 404 }
      );
    }
    
    const plano = await db.select().from(planos).where(eq(planos.id, usuario.planoId));
    
    if (plano.length === 0) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(plano[0]);
  } catch (error) {
    console.error('Erro ao buscar plano do usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
