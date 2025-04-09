-- Adicionar coluna usuario_id à tabela proprietarios
ALTER TABLE proprietarios ADD COLUMN usuario_id TEXT REFERENCES usuarios(id);
-- Atualizar registros existentes com o ID do admin
UPDATE proprietarios SET usuario_id = '89e269b1-0de8-43d4-bf61-3a6201ed7ae6';

-- Adicionar coluna usuario_id à tabela imoveis
ALTER TABLE imoveis ADD COLUMN usuario_id TEXT REFERENCES usuarios(id);
-- Atualizar registros existentes com o ID do admin
UPDATE imoveis SET usuario_id = '89e269b1-0de8-43d4-bf61-3a6201ed7ae6';

-- Adicionar coluna usuario_id à tabela inquilinos
ALTER TABLE inquilinos ADD COLUMN usuario_id TEXT REFERENCES usuarios(id);
-- Atualizar registros existentes com o ID do admin
UPDATE inquilinos SET usuario_id = '89e269b1-0de8-43d4-bf61-3a6201ed7ae6';

-- Adicionar coluna usuario_id à tabela recibos
ALTER TABLE recibos ADD COLUMN usuario_id TEXT REFERENCES usuarios(id);
-- Atualizar registros existentes com o ID do admin
UPDATE recibos SET usuario_id = '89e269b1-0de8-43d4-bf61-3a6201ed7ae6';
