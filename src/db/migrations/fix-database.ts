import Database from 'better-sqlite3';

async function fixDatabase() {
  try {
    console.log('Iniciando correção do banco de dados...');
    
    // Conectar diretamente ao banco de dados
    const db = new Database('./sqlite.db');
    
    try {
      // Verificar se a coluna existe
      const tableInfo = db.prepare('PRAGMA table_info(usuarios)').all();
      console.log('Estrutura atual da tabela:');
      console.log(tableInfo);
      
      const columnExists = tableInfo.some((col: any) => col.name === 'trocar_senha_no_proximo_login');
      
      if (columnExists) {
        console.log('A coluna trocar_senha_no_proximo_login já existe.');
      } else {
        console.log('Adicionando a coluna trocar_senha_no_proximo_login...');
        
        // Adicionar a coluna
        db.prepare(`
          ALTER TABLE usuarios ADD COLUMN trocar_senha_no_proximo_login INTEGER NOT NULL DEFAULT 0
        `).run();
        
        console.log('Coluna adicionada com sucesso!');
      }
      
      // Verificar a estrutura atualizada
      const updatedTableInfo = db.prepare('PRAGMA table_info(usuarios)').all();
      console.log('Estrutura atualizada da tabela:');
      console.log(updatedTableInfo);
      
    } catch (error) {
      console.error('Erro ao modificar a tabela:', error);
      
      // Abordagem alternativa: recriar a tabela
      console.log('Tentando abordagem alternativa...');
      
      // Iniciar uma transação
      const transaction = db.transaction(() => {
        // 1. Criar tabela temporária com a nova estrutura
        db.prepare(`
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
        `).run();
        
        // 2. Copiar dados da tabela antiga para a nova
        db.prepare(`
          INSERT INTO usuarios_new (id, nome, email, senha, ativo, admin, created_at, updated_at)
          SELECT id, nome, email, senha, ativo, admin, created_at, updated_at FROM usuarios
        `).run();
        
        // 3. Remover tabela antiga
        db.prepare('DROP TABLE usuarios').run();
        
        // 4. Renomear a nova tabela
        db.prepare('ALTER TABLE usuarios_new RENAME TO usuarios').run();
      });
      
      // Executar a transação
      transaction();
      
      console.log('Recriação da tabela concluída com sucesso!');
      
      // Verificar a estrutura final
      const finalTableInfo = db.prepare('PRAGMA table_info(usuarios)').all();
      console.log('Estrutura final da tabela:');
      console.log(finalTableInfo);
    }
    
    // Fechar a conexão
    db.close();
    
    console.log('Correção do banco de dados concluída!');
  } catch (error) {
    console.error('Erro durante a correção do banco de dados:', error);
  }
}

// Executar a função
fixDatabase()
  .then(() => console.log('Processo finalizado.'))
  .catch(err => console.error('Erro:', err));
