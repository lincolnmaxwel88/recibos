const { db } = require('./index.js');
const { proprietarios, imoveis, inquilinos, recibos } = require('./schema.js');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  console.log('Iniciando população do banco de dados...');

  // Criar proprietários
  const proprietario1Id = uuidv4();
  const proprietario2Id = uuidv4();

  await db.insert(proprietarios).values([
    {
      id: proprietario1Id,
      nome: 'João Silva',
      cpf: '123.456.789-00',
      telefone: '(11) 98765-4321',
      email: 'joao@exemplo.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: proprietario2Id,
      nome: 'Maria Oliveira',
      cpf: '987.654.321-00',
      telefone: '(21) 91234-5678',
      email: 'maria@exemplo.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  console.log('Proprietários criados com sucesso!');

  // Criar imóveis
  const imovel1Id = uuidv4();
  const imovel2Id = uuidv4();
  const imovel3Id = uuidv4();

  await db.insert(imoveis).values([
    {
      id: imovel1Id,
      proprietario_id: proprietario1Id,
      endereco: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 101',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      tipo: 'apartamento',
      observacoes: 'Próximo ao metrô',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: imovel2Id,
      proprietario_id: proprietario1Id,
      endereco: 'Avenida Principal',
      numero: '456',
      complemento: null,
      bairro: 'Jardim América',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04567-890',
      tipo: 'casa',
      observacoes: 'Com quintal grande',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: imovel3Id,
      proprietario_id: proprietario2Id,
      endereco: 'Rua Comercial',
      numero: '789',
      complemento: 'Sala 42',
      bairro: 'Centro',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      cep: '20000-123',
      tipo: 'comercial',
      observacoes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  console.log('Imóveis criados com sucesso!');

  // Criar inquilinos
  const inquilino1Id = uuidv4();
  const inquilino2Id = uuidv4();

  await db.insert(inquilinos).values([
    {
      id: inquilino1Id,
      nome: 'Carlos Pereira',
      cpf: '111.222.333-44',
      telefone: '(11) 91111-2222',
      email: 'carlos@exemplo.com',
      imovel_id: imovel1Id,
      data_inicio_contrato: '2023-01-01',
      data_fim_contrato: '2024-01-01',
      valor_aluguel: 1500.00,
      dia_vencimento: 10,
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: inquilino2Id,
      nome: 'Ana Souza',
      cpf: '555.666.777-88',
      telefone: '(21) 93333-4444',
      email: 'ana@exemplo.com',
      imovel_id: imovel3Id,
      data_inicio_contrato: '2023-03-15',
      data_fim_contrato: null,
      valor_aluguel: 2800.00,
      dia_vencimento: 5,
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  console.log('Inquilinos criados com sucesso!');

  // Criar recibos
  const recibo1Id = uuidv4();
  const recibo2Id = uuidv4();

  await db.insert('recibos').values([
    {
      id: recibo1Id,
      inquilino_id: inquilino1Id,
      imovel_id: imovel1Id,
      proprietario_id: proprietario1Id,
      data_emissao: '2023-04-01',
      mes_referencia: '04',
      ano_referencia: '2023',
      valor_aluguel: 1500.00,
      valor_agua: 80.00,
      valor_luz: 120.00,
      valor_iptu: 50.00,
      valor_juros: 0.00,
      valor_total: 1750.00,
      observacoes: null,
      pago: true,
      data_pagamento: '2023-04-10',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: recibo2Id,
      inquilino_id: inquilino2Id,
      imovel_id: imovel3Id,
      proprietario_id: proprietario2Id,
      data_emissao: '2023-04-01',
      mes_referencia: '04',
      ano_referencia: '2023',
      valor_aluguel: 2800.00,
      valor_agua: 0.00,
      valor_luz: 200.00,
      valor_iptu: 120.00,
      valor_juros: 0.00,
      valor_total: 3120.00,
      observacoes: 'Primeira locação',
      pago: false,
      data_pagamento: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  console.log('Recibos criados com sucesso!');
  console.log('População do banco de dados concluída com sucesso!');
}

// Executar a função de seed
seed()
  .then(() => {
    console.log('Processo de seed concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro durante o processo de seed:', error);
    process.exit(1);
  });
