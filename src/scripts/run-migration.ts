import Database from 'better-sqlite3';

// Conectar diretamente ao banco de dados
const db = new Database('./sqlite.db');

function runMigration() {
  try {
    console.log('Executando migração para adicionar usuarioId às tabelas...');
    
    // Obter o ID do usuário administrador padrão
    const adminUser = db.prepare('SELECT * FROM usuarios WHERE admin = 1 LIMIT 1').get() as { id: string };
    
    if (!adminUser) {
      throw new Error('Usuário administrador não encontrado. Não é possível continuar a migração.');
    }
    
    const adminId = adminUser.id;
    console.log(`Usando o administrador com ID ${adminId} como usuário padrão para registros existentes.`);

    // Tabelas para adicionar a coluna usuario_id
    const tables = ['proprietarios', 'imoveis', 'inquilinos', 'recibos'];
    
    // Iniciar uma transação para garantir que todas as alterações sejam feitas juntas
    db.exec('BEGIN TRANSACTION;');
    
    for (const table of tables) {
      try {
        // Verificar se a coluna já existe
        const columns = db.prepare(`PRAGMA table_info(${table})`).all();
        const columnExists = columns.some((col: any) => col.name === 'usuario_id');
        
        if (!columnExists) {
          console.log(`Adicionando coluna usuario_id à tabela ${table}...`);
          
          // Adicionar a coluna
          db.exec(`ALTER TABLE ${table} ADD COLUMN usuario_id TEXT REFERENCES usuarios(id);`);
          
          // Atualizar registros existentes
          db.exec(`UPDATE ${table} SET usuario_id = '${adminId}';`);
          
          console.log(`Coluna usuario_id adicionada com sucesso à tabela ${table}`);
        } else {
          console.log(`Coluna usuario_id já existe na tabela ${table}, pulando...`);
        }
      } catch (error) {
        // Reverter a transação em caso de erro
        db.exec('ROLLBACK;');
        console.error(`Erro ao adicionar coluna usuario_id à tabela ${table}:`, error);
        throw error;
      }
    }
    
    // Confirmar a transação
    db.exec('COMMIT;');
    
    console.log('Migração concluída com sucesso!');
    
    // Fechar a conexão com o banco de dados
    db.close();
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar migração:', error);
    process.exit(1);
  }
}

runMigration();
