import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './postgres';

// Função para executar as migrações
export async function runMigrations() {
  try {
    console.log('Executando migrações para PostgreSQL...');
    await migrate(db, { migrationsFolder: './src/db/migrations-pg' });
    console.log('Migrações PostgreSQL concluídas com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao executar migrações PostgreSQL:', error);
    return false;
  }
}

// Se este arquivo for executado diretamente
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erro fatal ao executar migrações:', error);
      process.exit(1);
    });
}
