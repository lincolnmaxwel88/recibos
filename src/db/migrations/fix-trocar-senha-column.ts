import { db } from '@/db';

async function fixTrocarSenhaColumn() {
  try {
    console.log('Iniciando correção da coluna trocar_senha_no_proximo_login...');
    
    // Verificar se a tabela existe
    const tableExists = await db.execute(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'
    `);
    
    if (!tableExists) {
      console.error('Tabela de usuários não encontrada!');
      return;
    }
    
    console.log('Tabela de usuários encontrada, verificando colunas...');
    
    // Verificar se a coluna já existe
    const tableInfo = await db.execute(`PRAGMA table_info(usuarios)`);
    console.log('Informações da tabela:', tableInfo);
    
    // Verificar se a coluna existe no schema
    const columnExists = tableInfo.rows.some((row: any) => 
      row.name === 'trocar_senha_no_proximo_login'
    );
    
    if (columnExists) {
      console.log('A coluna trocar_senha_no_proximo_login já existe na tabela.');
    } else {
      console.log('A coluna trocar_senha_no_proximo_login não existe, adicionando...');
      
      try {
        // Tentar adicionar a coluna
        await db.execute(`
          ALTER TABLE usuarios ADD COLUMN trocar_senha_no_proximo_login INTEGER NOT NULL DEFAULT 0
        `);
        console.log('Coluna adicionada com sucesso!');
      } catch (addError) {
        console.error('Erro ao adicionar coluna:', addError);
        
        // Abordagem alternativa: criar uma nova tabela e migrar os dados
        console.log('Tentando abordagem alternativa...');
        
        // 1. Criar tabela temporária com a nova estrutura
        await db.execute(`
          CREATE TABLE usuarios_new (
            id TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL,
            ativo INTEGER NOT NULL DEFAULT 1,
            admin INTEGER NOT NULL DEFAULT 0,
            trocar_senha_no_proximo_login INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )
        `);
        
        // 2. Copiar dados da tabela antiga para a nova
        await db.execute(`
          INSERT INTO usuarios_new (id, nome, email, senha, ativo, admin, created_at, updated_at)
          SELECT id, nome, email, senha, ativo, admin, created_at, updated_at FROM usuarios
        `);
        
        // 3. Remover tabela antiga
        await db.execute(`DROP TABLE usuarios`);
        
        // 4. Renomear a nova tabela
        await db.execute(`ALTER TABLE usuarios_new RENAME TO usuarios`);
        
        console.log('Migração alternativa concluída com sucesso!');
      }
    }
    
    console.log('Correção concluída!');
  } catch (error) {
    console.error('Erro durante a correção:', error);
  }
}

// Executar a função
fixTrocarSenhaColumn()
  .then(() => console.log('Processo finalizado.'))
  .catch(err => console.error('Erro:', err));
