import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { usuarios, planos, proprietarios, imoveis, inquilinos } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { getUsuarioFromRequest } from '@/utils/auth';

/**
 * Middleware para verificar se o usuário está dentro dos limites do seu plano
 */
export async function verificarLimitesPlano(
  request: NextRequest,
  operacao: 'proprietario' | 'imovel' | 'inquilino',
  acao: 'criar' | 'verificar'
) {
  try {
    // Obter o usuário da requisição
    const usuario = await getUsuarioFromRequest(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    // Se o usuário for administrador, não aplicar limites
    if (usuario.admin) {
      if (acao === 'verificar') {
        return NextResponse.json({
          limiteAtingido: false,
          planoAtual: 'Administrador',
          contagem: 0,
          limite: Infinity,
          percentualUtilizado: 0,
          admin: true
        });
      }
      // Para ação de criar, permitir sempre
      return null;
    }

    // Obter o plano do usuário
    const planoUsuario = await db.select()
      .from(planos)
      .where(eq(planos.id, usuario.planoId || 'basico'))
      .limit(1);

    if (!planoUsuario || planoUsuario.length === 0) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    const plano = planoUsuario[0];

    // Verificar os limites com base na operação
    let contagem = 0;
    let limite = 0;

    switch (operacao) {
      case 'proprietario':
        // Contar proprietários
        const proprietariosCount = await db.select({ count: count() })
          .from(proprietarios);
        contagem = proprietariosCount[0].count;
        limite = plano.limiteProprietarios;
        break;
      
      case 'imovel':
        // Contar imóveis
        const imoveisCount = await db.select({ count: count() })
          .from(imoveis);
        contagem = imoveisCount[0].count;
        limite = plano.limiteImoveis;
        break;
      
      case 'inquilino':
        // Contar inquilinos
        const inquilinosCount = await db.select({ count: count() })
          .from(inquilinos);
        contagem = inquilinosCount[0].count;
        limite = plano.limiteInquilinos;
        break;
    }

    // Se for uma ação de criação e já atingiu o limite, bloquear (exceto para admin, já tratado acima)
    if (acao === 'criar' && contagem >= limite) {
      return NextResponse.json(
        { 
          error: `Limite de ${operacao}s atingido para o plano ${plano.nome}`,
          limiteAtingido: true,
          planoAtual: plano.nome,
          contagem,
          limite
        },
        { status: 403 }
      );
    }

    // Se for apenas verificação, retornar informações sobre o limite
    if (acao === 'verificar') {
      return NextResponse.json({
        limiteAtingido: contagem >= limite,
        planoAtual: plano.nome,
        contagem,
        limite,
        percentualUtilizado: Math.round((contagem / limite) * 100)
      });
    }

    // Se chegou até aqui, está tudo ok
    return null;
  } catch (error) {
    console.error('Erro ao verificar limites do plano:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar limites do plano' },
      { status: 500 }
    );
  }
}
