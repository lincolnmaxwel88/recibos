const { sqliteTable, text, integer, real } = require('drizzle-orm/sqlite-core');

// Tabela de Proprietários
const proprietarios = sqliteTable('proprietarios', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  cpf: text('cpf').notNull(),
  telefone: text('telefone').notNull(),
  email: text('email').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// Tabela de Imóveis
const imoveis = sqliteTable('imoveis', {
  id: text('id').primaryKey(),
  proprietarioId: text('proprietario_id').notNull().references(() => proprietarios.id),
  endereco: text('endereco').notNull(),
  numero: text('numero').notNull(),
  complemento: text('complemento'),
  bairro: text('bairro').notNull(),
  cidade: text('cidade').notNull(),
  estado: text('estado').notNull(),
  cep: text('cep').notNull(),
  tipo: text('tipo').notNull(),
  observacoes: text('observacoes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// Tabela de Inquilinos
const inquilinos = sqliteTable('inquilinos', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  cpf: text('cpf').notNull(),
  telefone: text('telefone').notNull(),
  email: text('email').notNull(),
  imovelId: text('imovel_id').notNull().references(() => imoveis.id),
  dataInicioContrato: text('data_inicio_contrato').notNull(),
  dataFimContrato: text('data_fim_contrato'),
  valorAluguel: real('valor_aluguel').notNull(),
  diaVencimento: integer('dia_vencimento').notNull(),
  ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// Tabela de Recibos
const recibos = sqliteTable('recibos', {
  id: text('id').primaryKey(),
  inquilinoId: text('inquilino_id').notNull().references(() => inquilinos.id),
  imovelId: text('imovel_id').notNull().references(() => imoveis.id),
  proprietarioId: text('proprietario_id').notNull().references(() => proprietarios.id),
  dataEmissao: text('data_emissao').notNull(),
  mesReferencia: text('mes_referencia').notNull(),
  anoReferencia: text('ano_referencia').notNull(),
  valorAluguel: real('valor_aluguel').notNull(),
  valorAgua: real('valor_agua').notNull().default(0),
  valorLuz: real('valor_luz').notNull().default(0),
  valorIptu: real('valor_iptu').notNull().default(0),
  valorJuros: real('valor_juros').notNull().default(0),
  valorTotal: real('valor_total').notNull(),
  observacoes: text('observacoes'),
  pago: integer('pago', { mode: 'boolean' }).notNull().default(false),
  dataPagamento: text('data_pagamento'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

module.exports = {
  proprietarios,
  imoveis,
  inquilinos,
  recibos
};
