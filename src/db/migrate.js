// Este arquivo foi atualizado para usar o Vercel Postgres em vez do SQLite
const { sql } = require('@vercel/postgres');
const { db } = require('./index.js');

// Função para executar as migrações
async function executarMigracoes() {
  try {
    console.log('Executando migrações para PostgreSQL...');
    
    // Criar tabela de planos
    await sql`
      CREATE TABLE IF NOT EXISTS "planos" (
        "id" TEXT PRIMARY KEY,
        "nome" TEXT NOT NULL,
        "descricao" TEXT,
        "limiteImoveis" INTEGER NOT NULL DEFAULT 5,
        "limiteInquilinos" INTEGER NOT NULL DEFAULT 5,
        "limiteProprietarios" INTEGER NOT NULL DEFAULT 5,
        "permiteRelatoriosAvancados" BOOLEAN NOT NULL DEFAULT false,
        "permiteModelosPersonalizados" BOOLEAN NOT NULL DEFAULT false,
        "permiteMultiplosUsuarios" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL
      )
    `;
    
    // Criar tabela de usuários
    await sql`
      CREATE TABLE IF NOT EXISTS "usuarios" (
        "id" TEXT PRIMARY KEY,
        "nome" TEXT NOT NULL,
        "email" TEXT UNIQUE NOT NULL,
        "senha" TEXT NOT NULL,
        "planoId" TEXT NOT NULL REFERENCES "planos"("id"),
        "ativo" BOOLEAN NOT NULL DEFAULT true,
        "admin" BOOLEAN NOT NULL DEFAULT false,
        "trocarSenhaNoProximoLogin" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL
      )
    `;
    
    // Criar tabela de proprietários
    await sql`
      CREATE TABLE IF NOT EXISTS "proprietarios" (
        "id" TEXT PRIMARY KEY,
        "nome" TEXT NOT NULL,
        "cpf" TEXT,
        "telefone" TEXT,
        "email" TEXT,
        "usuarioId" TEXT NOT NULL REFERENCES "usuarios"("id"),
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL
      )
    `;
    
    // Criar tabela de imóveis
    await sql`
      CREATE TABLE IF NOT EXISTS "imoveis" (
        "id" TEXT PRIMARY KEY,
        "endereco" TEXT NOT NULL,
        "numero" TEXT,
        "complemento" TEXT,
        "bairro" TEXT,
        "cidade" TEXT,
        "estado" TEXT,
        "cep" TEXT,
        "tipo" TEXT,
        "observacoes" TEXT,
        "proprietarioId" TEXT NOT NULL REFERENCES "proprietarios"("id"),
        "usuarioId" TEXT NOT NULL REFERENCES "usuarios"("id"),
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL
      )
    `;
    
    // Criar tabela de inquilinos
    await sql`
      CREATE TABLE IF NOT EXISTS "inquilinos" (
        "id" TEXT PRIMARY KEY,
        "nome" TEXT NOT NULL,
        "cpf" TEXT,
        "telefone" TEXT,
        "email" TEXT,
        "dataInicioContrato" TEXT,
        "dataFimContrato" TEXT,
        "valorAluguel" REAL,
        "diaVencimento" INTEGER,
        "imovelId" TEXT REFERENCES "imoveis"("id"),
        "usuarioId" TEXT NOT NULL REFERENCES "usuarios"("id"),
        "ativo" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL
      )
    `;
    
    // Criar tabela de recibos
    await sql`
      CREATE TABLE IF NOT EXISTS "recibos" (
        "id" TEXT PRIMARY KEY,
        "numero" INTEGER NOT NULL,
        "dataEmissao" TEXT NOT NULL,
        "mesReferencia" TEXT NOT NULL,
        "valorTotal" REAL NOT NULL,
        "inquilinoId" TEXT NOT NULL REFERENCES "inquilinos"("id"),
        "imovelId" TEXT NOT NULL REFERENCES "imoveis"("id"),
        "usuarioId" TEXT NOT NULL REFERENCES "usuarios"("id"),
        "status" TEXT NOT NULL DEFAULT 'pendente',
        "dataPagamento" TEXT,
        "observacoes" TEXT,
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL
      )
    `;
    
    // Inserir planos padrão
    await sql`
      INSERT INTO "planos" ("id", "nome", "descricao", "limiteImoveis", "limiteInquilinos", "limiteProprietarios", "permiteRelatoriosAvancados", "permiteModelosPersonalizados", "permiteMultiplosUsuarios", "createdAt", "updatedAt")
      VALUES 
      ('basico', 'Básico', 'Plano básico com recursos limitados', 5, 5, 5, false, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('empresarial', 'Empresarial', 'Plano empresarial com recursos ilimitados', 100, 100, 100, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
    `;
    
    console.log('Migrações PostgreSQL concluídas com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao executar migrações PostgreSQL:', error);
    return false;
  }
}

// Executar migrações e sair
executarMigracoes()
  .then(() => {
    console.log('Processo de migração finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro fatal ao executar migrações:', error);
    process.exit(1);
  });
