import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { usuarios, planos } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcryptjs';

// Função para criar usuário admin e planos iniciais
export async function GET(request: NextRequest) {
  try {
    // Verificar se já existe algum usuário
    const usuariosExistentes = await db.select().from(usuarios);
    
    if (usuariosExistentes.length > 0) {
      return NextResponse.json({
        message: 'O banco de dados já está inicializado',
        usuariosCount: usuariosExistentes.length
      });
    }
    
    // Criar planos básicos
    const planosData = [
      {
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
      },
      {
        id: 'profissional',
        nome: 'Profissional',
        descricao: 'Plano profissional com recursos avançados',
        limiteImoveis: 20,
        limiteInquilinos: 20,
        limiteProprietarios: 20,
        permiteRelatoriosAvancados: true,
        permiteModelosPersonalizados: false,
        permiteMultiplosUsuarios: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
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
      }
    ];
    
    // Inserir planos
    await db.insert(planos).values(planosData);
    
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
    
    // Inserir usuário administrador
    await db.insert(usuarios).values(usuarioAdmin);
    
    return NextResponse.json({
      message: 'Banco de dados inicializado com sucesso',
      admin: {
        email: usuarioAdmin.email,
        senha: 'admin123' // Mostrar a senha em texto puro apenas na resposta
      },
      planos: planosData.length
    });
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return NextResponse.json(
      { error: 'Erro ao inicializar banco de dados', details: String(error) },
      { status: 500 }
    );
  }
}
