import { db } from '@/db';

export async function addTrocarSenhaColumn() {
  try {
    // Verificar se a coluna já existe
    let checkColumnExists = false;
    
    try {
      const result = await db.all(`PRAGMA table_info(usuarios)`);
      const columns = result || [];
      checkColumnExists = columns.some((col: any) => col.name === 'trocar_senha_no_proximo_login');
    } catch (error) {
      console.error('Erro ao verificar colunas:', error);
      checkColumnExists = false;
    }
    
    if (!checkColumnExists) {
      // Adicionar a coluna trocar_senha_no_proximo_login à tabela de usuários
      await db.run(`
        ALTER TABLE usuarios ADD COLUMN trocar_senha_no_proximo_login INTEGER NOT NULL DEFAULT 0
      `);
      console.log('Coluna "trocar_senha_no_proximo_login" adicionada com sucesso à tabela de usuários');
    } else {
      console.log('Coluna "trocar_senha_no_proximo_login" já existe na tabela de usuários');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao adicionar coluna "trocar_senha_no_proximo_login" à tabela de usuários:', error);
    throw error;
  }
}
