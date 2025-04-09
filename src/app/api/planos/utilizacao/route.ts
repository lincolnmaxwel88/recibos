import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { planos, proprietarios, imoveis, inquilinos, usuarios } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { getUsuarioFromRequest } from '@/utils/auth';
import { UsuarioService } from '@/services/usuarioService';

export async function GET(request: NextRequest) {
  try {
    // Obter o token do cookie
    const token = request.cookies.get('auth_token')?.value;
    console.log('Token recebido na API de utilização:', token ? 'Presente' : 'Ausente');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Usuário não autenticado - Token ausente' },
        { status: 401 }
      );
    }
    
    // Validar o token e obter o usuário
    const usuario = await UsuarioService.validateToken(token);
    console.log('Resultado da validação do token:', usuario ? 'Usuário encontrado' : 'Token inválido');
    
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não autenticado - Token inválido' },
        { status: 401 }
      );
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

    // Contar todos os proprietários (não há separação por usuário no esquema atual)
    const proprietariosCount = await db.select({ count: count() })
      .from(proprietarios);
    
    // Contar todos os imóveis
    const imoveisCount = await db.select({ count: count() })
      .from(imoveis);
    
    // Contar todos os inquilinos
    const inquilinosCount = await db.select({ count: count() })
      .from(inquilinos);

    // Calcular percentuais de utilização
    const utilizacaoProprietarios = Math.min(100, Math.round((proprietariosCount[0].count / plano.limiteProprietarios) * 100));
    const utilizacaoImoveis = Math.min(100, Math.round((imoveisCount[0].count / plano.limiteImoveis) * 100));
    const utilizacaoInquilinos = Math.min(100, Math.round((inquilinosCount[0].count / plano.limiteInquilinos) * 100));

    return NextResponse.json({
      plano: {
        id: plano.id,
        nome: plano.nome,
        descricao: plano.descricao,
        limiteProprietarios: plano.limiteProprietarios,
        limiteImoveis: plano.limiteImoveis,
        limiteInquilinos: plano.limiteInquilinos,
        permiteRelatoriosAvancados: plano.permiteRelatoriosAvancados,
        permiteModelosPersonalizados: plano.permiteModelosPersonalizados,
        permiteMultiplosUsuarios: plano.permiteMultiplosUsuarios
      },
      utilizacao: {
        proprietarios: {
          atual: proprietariosCount[0].count,
          limite: plano.limiteProprietarios,
          percentual: utilizacaoProprietarios
        },
        imoveis: {
          atual: imoveisCount[0].count,
          limite: plano.limiteImoveis,
          percentual: utilizacaoImoveis
        },
        inquilinos: {
          atual: inquilinosCount[0].count,
          limite: plano.limiteInquilinos,
          percentual: utilizacaoInquilinos
        }
      }
    });
  } catch (error) {
    console.error('Erro ao obter utilização do plano:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
