import { db } from '@/db';

export async function addAdminColumn() {
  try {
    // Verificar se a coluna já existe
    let checkColumnExists = false;
    
    try {
      const result = await db.all(`PRAGMA table_info(usuarios)`);
      const columns = result || [];
      checkColumnExists = columns.some((col: any) => col.name === 'admin');
    } catch (error) {
      console.error('Erro ao verificar colunas:', error);
      checkColumnExists = false;
    }
    
    if (!checkColumnExists) {
      // Adicionar a coluna admin à tabela de usuários
      await db.run(`
        ALTER TABLE usuarios ADD COLUMN admin INTEGER NOT NULL DEFAULT 0
      `);
      console.log('Coluna "admin" adicionada com sucesso à tabela de usuários');
    } else {
      console.log('Coluna "admin" já existe na tabela de usuários');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao adicionar coluna "admin" à tabela de usuários:', error);
    throw error;
  }
}
