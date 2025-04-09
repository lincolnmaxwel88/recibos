import { db } from '@/db';

export async function addAtivoColumn() {
  try {
    // Verificar se a coluna já existe
    let checkColumnExists = false;
    
    try {
      const result = await db.all(`PRAGMA table_info(usuarios)`);
      const columns = result || [];
      checkColumnExists = columns.some((col: any) => col.name === 'ativo');
    } catch (error) {
      console.error('Erro ao verificar colunas:', error);
      checkColumnExists = false;
    }
    
    if (!checkColumnExists) {
      // Adicionar a coluna ativo à tabela de usuários
      await db.run(`
        ALTER TABLE usuarios ADD COLUMN ativo INTEGER NOT NULL DEFAULT 1
      `);
      console.log('Coluna "ativo" adicionada com sucesso à tabela de usuários');
    } else {
      console.log('Coluna "ativo" já existe na tabela de usuários');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao adicionar coluna "ativo" à tabela de usuários:', error);
    throw error;
  }
}
