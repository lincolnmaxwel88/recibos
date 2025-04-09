const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { proprietarios, imoveis, inquilinos, recibos } = require('./schema.js');

// Inicializa o banco de dados SQLite
const sqlite = new Database('./sqlite.db');
const db = drizzle(sqlite, { schema: { proprietarios, imoveis, inquilinos, recibos } });

// Exporta o objeto de banco de dados
module.exports = { db };

// Função para fechar a conexão com o banco de dados
function closeDatabase() {
  sqlite.close();
}

module.exports.closeDatabase = closeDatabase;
