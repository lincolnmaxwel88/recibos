import { NextRequest, NextResponse } from 'next/server';
import { UsuarioService } from '@/services/usuarioService';
import { runMigrations } from '@/db/migrations';

// Esta rota é apenas para desenvolvimento, para criar um usuário inicial
export async function GET(request: NextRequest) {
  try {
    // Executar migrações para garantir que todas as tabelas existam
    await runMigrations();
    
    try {
      // Verificar se já existe algum usuário
      const usuarios = await UsuarioService.getAll();
      
      if (usuarios.length > 0) {
        return NextResponse.json(
          { message: 'Já existem usuários no sistema' },
          { status: 200 }
        );
      }
      
      // Criar um usuário administrador padrão para testes
      const novoUsuario = await UsuarioService.create({
        nome: 'Administrador',
        email: 'admin@example.com',
        senha: 'senha123',
        admin: true
      });
      
      // Não retornar a senha
      const { senha: _, ...usuarioSemSenha } = novoUsuario;
      
      return NextResponse.json(
        { message: 'Usuário inicial criado com sucesso', usuario: usuarioSemSenha },
        { status: 201 }
      );
    } catch (serviceError) {
      console.error('Erro no serviço de usuário:', serviceError);
      return NextResponse.json(
        { error: 'Erro ao criar usuário inicial', details: serviceError instanceof Error ? serviceError.message : 'Erro desconhecido' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao executar migrações:', error);
    return NextResponse.json(
      { error: 'Erro ao configurar o banco de dados', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
