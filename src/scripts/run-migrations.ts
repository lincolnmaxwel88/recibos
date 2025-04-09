import { runMigrations } from '../db/migrations';

async function main() {
  try {
    console.log('Iniciando execução das migrações...');
    await runMigrations();
    console.log('Migrações executadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar migrações:', error);
    process.exit(1);
  }
}

main();
