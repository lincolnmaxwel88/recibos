import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';

// Criar instância do drizzle com o cliente do Vercel Postgres
export const db = drizzle(sql, { schema });

// Função para verificar a conexão com o banco de dados
export async function checkDatabaseConnection() {
  try {
    // Tenta executar uma consulta simples
    const result = await sql`SELECT 1 as check`;
    console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados PostgreSQL:', error);
    return false;
  }
}
