import { db } from '@/db';
import { usuarios } from '@/db/schema';

export async function addPlanoColumn() {
  try {
    console.log('Verificando coluna plano_id na tabela usuarios...');
    
    // Verificar se a coluna já existe
    const result = await db.all(`
      SELECT name FROM pragma_table_info('usuarios') WHERE name = 'plano_id'
    `);
    
    if (result.length === 0) {
      console.log('Adicionando coluna plano_id à tabela usuarios...');
      
      // Adicionar a coluna
      await db.run(`
        ALTER TABLE usuarios ADD COLUMN plano_id TEXT DEFAULT 'basico'
      `);
      
      console.log('Coluna plano_id adicionada com sucesso!');
    } else {
      console.log('Coluna plano_id já existe na tabela usuarios.');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao adicionar coluna plano_id:', error);
    throw error;
  }
}
