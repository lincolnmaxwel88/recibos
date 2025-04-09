import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Tabela de Proprietários
export const proprietarios = sqliteTable('proprietarios', {
  id: text('id').primaryKey(),
  usuarioId: text('usuario_id').notNull().references(() => usuarios.id),
  nome: text('nome').notNull(),
  cpf: text('cpf').notNull(),
  telefone: text('telefone').notNull(),
  email: text('email').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// Tabela de Planos
export const planos = sqliteTable('planos', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  descricao: text('descricao').notNull(),
  limiteImoveis: integer('limite_imoveis').notNull(),
  limiteInquilinos: integer('limite_inquilinos').notNull(),
  limiteProprietarios: integer('limite_proprietarios').notNull(),
  permiteRelatoriosAvancados: integer('permite_relatorios_avancados', { mode: 'boolean' }).notNull().default(false),
  permiteModelosPersonalizados: integer('permite_modelos_personalizados', { mode: 'boolean' }).notNull().default(false),
  permiteMultiplosUsuarios: integer('permite_multiplos_usuarios', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// Tabela de Usuários
export const usuarios = sqliteTable('usuarios', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  senha: text('senha').notNull(),
  planoId: text('plano_id').references(() => planos.id).default('basico'),
  ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
  admin: integer('admin', { mode: 'boolean' }).notNull().default(false),
  trocarSenhaNoProximoLogin: integer('trocar_senha_no_proximo_login', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// Tabela de Imóveis
export const imoveis = sqliteTable('imoveis', {
  id: text('id').primaryKey(),
  usuarioId: text('usuario_id').notNull().references(() => usuarios.id),
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
export const inquilinos = sqliteTable('inquilinos', {
  id: text('id').primaryKey(),
  usuarioId: text('usuario_id').notNull().references(() => usuarios.id),
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
export const recibos = sqliteTable('recibos', {
  id: text('id').primaryKey(),
  usuarioId: text('usuario_id').notNull().references(() => usuarios.id),
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
  
  // Novos campos para o recibo
  proximoReajuste: text('proximo_reajuste'),
  formaReajuste: text('forma_reajuste').default('Anual'),
  vencimentoContrato: text('vencimento_contrato'),
  tipoAluguel: text('tipo_aluguel').default('Residencial'),
  vencimento: text('vencimento'),
  codigoLocatario: text('codigo_locatario'),
  numeroRecibo: text('numero_recibo'),
  
  // Campos adicionais para valores específicos
  valorCorrMont: real('valor_corr_mont').default(0),
  valorJuridico: real('valor_juridico').default(0),
  valorBonificacao: real('valor_bonificacao').default(0),
  valorAbatimento: real('valor_abatimento').default(0),
  valorIRF: real('valor_irf').default(0),
  
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});
