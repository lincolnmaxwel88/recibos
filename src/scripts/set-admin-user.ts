import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function setAdminUser() {
  try {
    console.log('Iniciando atualização do usuário para administrador...');
    
    // Verificar se a coluna admin existe
    try {
      const tableInfo = await db.all(`PRAGMA table_info(usuarios)`);
      const adminColumnExists = tableInfo.some((col: any) => col.name === 'admin');
      
      if (!adminColumnExists) {
        console.log('A coluna admin não existe. Adicionando...');
        await db.run(`ALTER TABLE usuarios ADD COLUMN admin INTEGER NOT NULL DEFAULT 0`);
        console.log('Coluna admin adicionada com sucesso.');
      } else {
        console.log('A coluna admin já existe.');
      }
    } catch (error) {
      console.error('Erro ao verificar/adicionar coluna admin:', error);
      throw error;
    }
    
    // Atualizar todos os usuários existentes para serem administradores
    try {
      const result = await db.update(usuarios)
        .set({ admin: 1 })
        .run();
      
      console.log('Usuários atualizados para administradores com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuários:', error);
      throw error;
    }
    
    console.log('Processo concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o processo:', error);
  }
}

setAdminUser();
