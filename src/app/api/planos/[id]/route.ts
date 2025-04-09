import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { planos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUsuarioFromRequest } from '@/utils/auth';

// Obter um plano específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const usuario = await getUsuarioFromRequest(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar se é administrador
    if (!usuario.admin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }
    
    const plano = await db.select().from(planos).where(eq(planos.id, params.id));
    
    if (plano.length === 0) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(plano[0]);
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

// Atualizar um plano
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const usuario = await getUsuarioFromRequest(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar se é administrador
    if (!usuario.admin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    
    // Verificar se o plano existe
    const planoExistente = await db.select().from(planos).where(eq(planos.id, params.id));
    if (planoExistente.length === 0) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }
    
    // Validações básicas
    if (!data.nome || !data.descricao) {
      return NextResponse.json(
        { error: 'Nome e descrição são obrigatórios' },
        { status: 400 }
      );
    }
    
    if (data.limiteProprietarios <= 0 || data.limiteImoveis <= 0 || data.limiteInquilinos <= 0) {
      return NextResponse.json(
        { error: 'Os limites devem ser maiores que zero' },
        { status: 400 }
      );
    }
    
    // Atualizar o plano
    const now = new Date();
    await db.update(planos)
      .set({
        nome: data.nome,
        descricao: data.descricao,
        limiteProprietarios: data.limiteProprietarios,
        limiteImoveis: data.limiteImoveis,
        limiteInquilinos: data.limiteInquilinos,
        permiteRelatoriosAvancados: data.permiteRelatoriosAvancados,
        permiteModelosPersonalizados: data.permiteModelosPersonalizados,
        permiteMultiplosUsuarios: data.permiteMultiplosUsuarios,
        updatedAt: now.toISOString()
      })
      .where(eq(planos.id, params.id));
    
    // Buscar o plano atualizado
    const planoAtualizado = await db.select().from(planos).where(eq(planos.id, params.id));
    
    return NextResponse.json(planoAtualizado[0]);
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
