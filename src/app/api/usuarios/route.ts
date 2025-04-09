import { NextRequest, NextResponse } from 'next/server';
import { UsuarioService } from '@/services/usuarioService';

// Listar todos os usuários
export async function GET(request: NextRequest) {
  try {
    const usuarios = await UsuarioService.getAll();
    
    // Remover a senha dos usuários antes de retornar
    const usuariosSemSenha = usuarios.map(usuario => {
      const { senha, ...usuarioSemSenha } = usuario;
      return usuarioSemSenha;
    });
    
    return NextResponse.json(usuariosSemSenha);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

// Criar um novo usuário
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validações básicas
    if (!data.nome || !data.email || !data.senha) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }
    
    try {
      const novoUsuario = await UsuarioService.create({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        admin: data.admin,
        trocarSenhaNoProximoLogin: data.trocarSenhaNoProximoLogin
      });
      
      // Não retornar a senha
      const { senha: _, ...usuarioSemSenha } = novoUsuario;
      
      return NextResponse.json(usuarioSemSenha, { status: 201 });
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
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}
