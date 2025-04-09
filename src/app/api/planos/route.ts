import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { planos } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const planosData = await db.select().from(planos);
    return NextResponse.json(planosData);
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar planos' },
      { status: 500 }
    );
  }
}
