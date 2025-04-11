import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

// Função para executar as migrações diretamente
export async function POST(request: NextRequest) {
  try {
    // Verificar se a variável de ambiente POSTGRES_URL está definida
    const postgresUrl = process.env.POSTGRES_URL;
    
    if (!postgresUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Variável de ambiente POSTGRES_URL não está definida' 
        },
        { status: 500 }
      );
    }
    
    // Criar cliente postgres
    const client = postgres(postgresUrl, { prepare: false });
    
    try {
      // Ler o arquivo SQL de migração
      const migrationPath = path.join(process.cwd(), 'src', 'db', 'migrations-pg', '0000_initial_schema.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      
      // Executar o SQL de migração
      await client.unsafe(migrationSql);
      
      return NextResponse.json({
        success: true,
        message: 'Migração executada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao executar migração:', error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Erro ao executar migração: ${String(error)}` 
        },
        { status: 500 }
      );
    } finally {
      // Fechar a conexão com o banco de dados
      await client.end();
    }
  } catch (error) {
    console.error('Erro ao executar migração:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: String(error) 
      },
      { status: 500 }
    );
  }
}
