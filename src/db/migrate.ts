import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';

// Executa as migrações
console.log('Executando migrações...');
migrate(db, { migrationsFolder: './src/db/migrations' });
console.log('Migrações concluídas com sucesso!');

// Fecha a conexão com o banco de dados
process.exit(0);
