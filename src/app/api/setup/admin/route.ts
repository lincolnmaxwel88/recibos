import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { usuarios, planos } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcryptjs';

// Função para criar usuário admin personalizado
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
    
    // Criar plano básico
    const planoBasico = {
      id: 'basico',
      nome: 'Básico',
      descricao: 'Plano básico com recursos limitados',
      limiteImoveis: 5,
      limiteInquilinos: 5,
      limiteProprietarios: 5,
      permiteRelatoriosAvancados: false,
      permiteModelosPersonalizados: false,
      permiteMultiplosUsuarios: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Criar plano empresarial
    const planoEmpresarial = {
      id: 'empresarial',
      nome: 'Empresarial',
      descricao: 'Plano empresarial com recursos ilimitados',
      limiteImoveis: 100,
      limiteInquilinos: 100,
      limiteProprietarios: 100,
      permiteRelatoriosAvancados: true,
      permiteModelosPersonalizados: true,
      permiteMultiplosUsuarios: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Tentar inserir planos (ignorar erro se já existirem)
    try {
      await db.insert(planos).values(planoBasico);
      await db.insert(planos).values(planoEmpresarial);
    } catch (planoError) {
      console.log('Planos já existem ou erro ao inserir:', planoError);
      // Continuar mesmo se houver erro
    }
    
    // Criar senha com hash
    const senhaHash = await hash(senha, 10);
    
    // Criar usuário administrador
    const usuarioAdmin = {
      id: uuidv4(),
      nome: nome,
      email: email,
      senha: senhaHash,
      planoId: 'empresarial',
      ativo: true,
      admin: true,
      trocarSenhaNoProximoLogin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Tentar inserir usuário administrador
    try {
      await db.insert(usuarios).values(usuarioAdmin);
      
      return NextResponse.json({
        message: 'Administrador criado com sucesso!',
        success: true
      });
    } catch (userError) {
      console.error('Erro ao criar usuário:', userError);
      
      // Verificar se é um erro de usuário duplicado
      const errorMsg = String(userError);
      if (errorMsg.includes('UNIQUE constraint failed') && errorMsg.includes('email')) {
        return NextResponse.json(
          { error: 'Este email já está em uso' },
          { status: 400 }
        );
      }
      
      throw userError; // Lançar o erro para ser capturado pelo catch externo
    }
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
    
    return NextResponse.json(
      { error: 'Erro ao criar administrador', details: String(error) },
      { status: 500 }
    );
  }
}
