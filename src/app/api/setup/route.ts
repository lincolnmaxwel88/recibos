import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { usuarios, planos } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcryptjs';

// Função para criar usuário admin e planos iniciais
export async function GET(request: NextRequest) {
  try {
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
    const senhaHash = await hash('admin123', 10);
    
    // Criar usuário administrador
    const usuarioAdmin = {
      id: uuidv4(),
      nome: 'Administrador',
      email: 'admin@admin.com',
      senha: senhaHash,
      planoId: 'empresarial',
      ativo: true,
      admin: true,
      trocarSenhaNoProximoLogin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Tentar inserir usuário administrador (ignorar erro se já existir)
    try {
      await db.insert(usuarios).values(usuarioAdmin);
    } catch (userError) {
      console.log('Usuário já existe ou erro ao inserir:', userError);
      // Continuar mesmo se houver erro
    }
    
    return NextResponse.json({
      message: 'Setup concluído com sucesso',
      admin: {
        email: 'admin@admin.com',
        senha: 'admin123'
      }
    });
  } catch (error) {
    console.error('Erro no setup:', error);
    return NextResponse.json(
      { error: 'Erro no setup', details: String(error) },
      { status: 500 }
    );
  }
}
