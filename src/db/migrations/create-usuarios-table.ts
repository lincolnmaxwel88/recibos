import { db } from '@/db';
import { usuarios } from '@/db/schema';

export async function createUsuariosTable() {
  try {
    // Verificar se a tabela já existe
    const tableExists = await db.select().from(usuarios).limit(1).catch(() => null);
    
    if (tableExists === null) {
      // Criar a tabela de usuários
      await db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          senha TEXT NOT NULL,
          ativo INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
      console.log('Tabela de usuários criada com sucesso');
    } else {
      console.log('Tabela de usuários já existe');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao criar tabela de usuários:', error);
    throw error;
  }
}
