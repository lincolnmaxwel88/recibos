import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/db/postgres';

// Configurar para usar o runtime de borda da Vercel
export const runtime = 'edge';

// Função para verificar a conexão com o banco de dados
export async function GET(request: NextRequest) {
  try {
    // Verifica se a variável de ambiente POSTGRES_URL está definida
    const postgresUrl = process.env.POSTGRES_URL;
    
    if (!postgresUrl) {
      return NextResponse.json(
        { 
          connected: false, 
          error: 'Variável de ambiente POSTGRES_URL não está definida' 
        },
        { status: 500 }
      );
    }
    
    // Tenta estabelecer conexão com o banco de dados
    const connected = await checkDatabaseConnection();
    
    return NextResponse.json({ connected });
  } catch (error) {
    console.error('Erro ao verificar conexão com o banco de dados:', error);
    
    return NextResponse.json(
      { 
        connected: false, 
        error: String(error) 
      },
      { status: 500 }
    );
  }
}
