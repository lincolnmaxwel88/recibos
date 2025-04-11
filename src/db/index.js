// Importar o cliente SQL do Vercel Postgres
const { sql } = require('@vercel/postgres');
const { drizzle } = require('drizzle-orm/vercel-postgres');
const { proprietarios, imoveis, inquilinos, recibos } = require('./schema.js');

// Criar instância do drizzle com o cliente do Vercel Postgres
const db = drizzle(sql, { schema: { proprietarios, imoveis, inquilinos, recibos } });

// Exporta o objeto de banco de dados
module.exports = { db };

// Função para verificar a conexão com o banco de dados
async function checkDatabaseConnection() {
  try {
    // Tenta executar uma consulta simples
    const result = await sql`SELECT 1 as check`;
    console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados PostgreSQL:', error);
    return false;
  }
}

// Função para fechar a conexão com o banco de dados (mantida para compatibilidade)
function closeDatabase() {
  // Não é necessário fechar explicitamente a conexão com o Vercel Postgres
  console.log('Conexão com o banco de dados fechada');
}

module.exports.closeDatabase = closeDatabase;
module.exports.checkDatabaseConnection = checkDatabaseConnection;
