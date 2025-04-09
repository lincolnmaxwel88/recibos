import { NextRequest, NextResponse } from 'next/server';
import { ProprietarioService } from '@/services/proprietarioService';
import { verificarLimitesPlano } from '@/middleware/verificarLimitesPlano';
import { getUsuarioFromRequest } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // Obter o usuário autenticado
    const usuario = await getUsuarioFromRequest(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    const proprietarios = await ProprietarioService.getAll(usuario.id, usuario.admin);
    return NextResponse.json(proprietarios);
  } catch (error) {
    console.error('Erro ao buscar proprietários:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validações básicas
    if (!data.nome || !data.cpf || !data.telefone || !data.email) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Verificar limites do plano
    const verificacaoLimites = await verificarLimitesPlano(request, 'proprietario', 'criar');
    if (verificacaoLimites) {
      return verificacaoLimites;
    }
    
    try {
      // Obter o usuário autenticado
      const usuario = await getUsuarioFromRequest(request);
      if (!usuario) {
        return NextResponse.json(
          { error: 'Usuário não autenticado' },
          { status: 401 }
        );
      }
      
      const novoProprietario = await ProprietarioService.create({
        nome: data.nome,
        cpf: data.cpf,
        telefone: data.telefone,
        email: data.email,
        usuarioId: usuario.id
      });
      
      return NextResponse.json(novoProprietario, { status: 201 });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        return NextResponse.json(
          { error: serviceError.message },
          { status: 400 }
        );
      }
      throw serviceError;
    }
  } catch (error) {
    console.error('Erro ao criar proprietário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
