import { sql } from 'drizzle-orm';
import { db } from '..';

export async function addValoresAdicionais() {
  console.log('Adicionando campos de valores adicionais à tabela recibos...');
  
  try {
    // Adicionar as colunas diretamente, o SQLite irá ignorar se já existirem
    try {
      await db.run(sql`ALTER TABLE recibos ADD COLUMN valor_corr_mont REAL DEFAULT 0`);
      console.log('Coluna valor_corr_mont adicionada com sucesso');
    } catch (err) {
      console.log('Coluna valor_corr_mont já existe ou erro ao adicionar');
    }
    
    try {
      await db.run(sql`ALTER TABLE recibos ADD COLUMN valor_juridico REAL DEFAULT 0`);
      console.log('Coluna valor_juridico adicionada com sucesso');
    } catch (err) {
      console.log('Coluna valor_juridico já existe ou erro ao adicionar');
    }
    
    try {
      await db.run(sql`ALTER TABLE recibos ADD COLUMN valor_bonificacao REAL DEFAULT 0`);
      console.log('Coluna valor_bonificacao adicionada com sucesso');
    } catch (err) {
      console.log('Coluna valor_bonificacao já existe ou erro ao adicionar');
    }
    
    try {
      await db.run(sql`ALTER TABLE recibos ADD COLUMN valor_abatimento REAL DEFAULT 0`);
      console.log('Coluna valor_abatimento adicionada com sucesso');
    } catch (err) {
      console.log('Coluna valor_abatimento já existe ou erro ao adicionar');
    }
    
    try {
      await db.run(sql`ALTER TABLE recibos ADD COLUMN valor_irf REAL DEFAULT 0`);
      console.log('Coluna valor_irf adicionada com sucesso');
    } catch (err) {
      console.log('Coluna valor_irf já existe ou erro ao adicionar');
    }
    
    console.log('Migração de valores adicionais concluída com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao adicionar campos de valores adicionais:', error);
    throw error;
  }
}
