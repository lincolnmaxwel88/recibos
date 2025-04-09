// Script para configurar o banco de dados em produção
require('@swc/register');

const { migrate } = require('./migrate');
const { seed } = require('./seed');

async function setup() {
  console.log('Iniciando configuração do banco de dados...');
  
  try {
    // Executar migrações
    console.log('Executando migrações...');
    await migrate();
    console.log('Migrações concluídas com sucesso!');
    
    // Executar seed (apenas se necessário)
    const shouldSeed = process.env.SEED_DATABASE === 'true';
    if (shouldSeed) {
      console.log('Executando seed do banco de dados...');
      await seed();
      console.log('Seed concluído com sucesso!');
    } else {
      console.log('Pulando seed do banco de dados (defina SEED_DATABASE=true para executar)');
    }
    
    console.log('Configuração do banco de dados concluída!');
  } catch (error) {
    console.error('Erro durante a configuração do banco de dados:', error);
    process.exit(1);
  }
}

setup();
