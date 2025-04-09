import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Determinar o caminho do banco de dados com base no ambiente
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/data/sqlite.db'  // No Railway, usar o diretório /data que é persistente
  : './sqlite.db';     // Em desenvolvimento local, usar o diretório raiz

// Inicializa o banco de dados SQLite
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Função para fechar a conexão com o banco de dados
export function closeDatabase() {
  sqlite.close();
}
