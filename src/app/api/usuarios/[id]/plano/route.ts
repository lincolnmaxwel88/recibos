import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PlanoId } from '@/types/plano';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { planoId } = await request.json();
    
    if (!planoId || !['basico', 'profissional', 'empresarial'].includes(planoId)) {
      return NextResponse.json(
        { error: 'ID de plano inválido' },
        { status: 400 }
      );
    }
    
    // Atualizar o plano do usuário
    await db.update(usuarios)
      .set({
        planoId: planoId as PlanoId,
        updatedAt: new Date().toISOString()
      })
      .where(eq(usuarios.id, params.id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar plano do usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar plano do usuário' },
      { status: 500 }
    );
  }
}
