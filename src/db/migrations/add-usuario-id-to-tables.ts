import { db } from '..';
import { usuarios } from '../schema';
import { sql } from 'drizzle-orm';

// Esta migração adiciona o campo usuarioId às tabelas existentes
// e associa todos os registros existentes ao usuário administrador padrão

export async function addUsuarioIdToTables() {
  try {
    console.log('Iniciando migração para adicionar usuarioId às tabelas...');
    
    // Obter o ID do usuário administrador padrão
    const adminUser = await db.query.usuarios.findFirst({
      where: (user, { eq }) => eq(user.admin, true)
    });
    
    if (!adminUser) {
      throw new Error('Usuário administrador não encontrado. Não é possível continuar a migração.');
    }
    
    const adminId = adminUser.id;
    console.log(`Usando o administrador com ID ${adminId} como usuário padrão para registros existentes.`);

    // Adicionar coluna usuarioId à tabela proprietarios e atualizar registros existentes
    await db.run(sql`ALTER TABLE proprietarios ADD COLUMN usuario_id TEXT REFERENCES usuarios(id)`);
    await db.run(sql`UPDATE proprietarios SET usuario_id = ${adminId}`);
    
    // Adicionar coluna usuarioId à tabela imoveis e atualizar registros existentes
    await db.run(sql`ALTER TABLE imoveis ADD COLUMN usuario_id TEXT REFERENCES usuarios(id)`);
    await db.run(sql`UPDATE imoveis SET usuario_id = ${adminId}`);
    
    // Adicionar coluna usuarioId à tabela inquilinos e atualizar registros existentes
    await db.run(sql`ALTER TABLE inquilinos ADD COLUMN usuario_id TEXT REFERENCES usuarios(id)`);
    await db.run(sql`UPDATE inquilinos SET usuario_id = ${adminId}`);
    
    // Adicionar coluna usuarioId à tabela recibos e atualizar registros existentes
    await db.run(sql`ALTER TABLE recibos ADD COLUMN usuario_id TEXT REFERENCES usuarios(id)`);
    await db.run(sql`UPDATE recibos SET usuario_id = ${adminId}`);
    
    console.log('Migração para adicionar usuarioId às tabelas concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migração para adicionar usuarioId às tabelas:', error);
    throw error;
  }
}
