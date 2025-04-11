import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Variáveis de ambiente para conexão com o Postgres
// Estas variáveis serão automaticamente definidas pela Vercel quando você adicionar o Postgres
const connectionString = process.env.POSTGRES_URL || '';

// Criar cliente postgres
const client = postgres(connectionString, { prepare: false });

// Criar instância do drizzle com o cliente postgres
export const db = drizzle(client, { schema });

// Função para verificar a conexão com o banco de dados
export async function checkDatabaseConnection() {
  try {
    // Tenta executar uma consulta simples
    await client`SELECT 1`;
    console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados PostgreSQL:', error);
    return false;
  }
}
