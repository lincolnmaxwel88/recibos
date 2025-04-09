CREATE TABLE `imoveis` (
	`id` text PRIMARY KEY NOT NULL,
	`proprietario_id` text NOT NULL,
	`endereco` text NOT NULL,
	`numero` text NOT NULL,
	`complemento` text,
	`bairro` text NOT NULL,
	`cidade` text NOT NULL,
	`estado` text NOT NULL,
	`cep` text NOT NULL,
	`tipo` text NOT NULL,
	`observacoes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`proprietario_id`) REFERENCES `proprietarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `inquilinos` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`cpf` text NOT NULL,
	`telefone` text NOT NULL,
	`email` text NOT NULL,
	`imovel_id` text NOT NULL,
	`data_inicio_contrato` text NOT NULL,
	`data_fim_contrato` text,
	`valor_aluguel` real NOT NULL,
	`dia_vencimento` integer NOT NULL,
	`ativo` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`imovel_id`) REFERENCES `imoveis`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `proprietarios` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`cpf` text NOT NULL,
	`telefone` text NOT NULL,
	`email` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recibos` (
	`id` text PRIMARY KEY NOT NULL,
	`inquilino_id` text NOT NULL,
	`imovel_id` text NOT NULL,
	`proprietario_id` text NOT NULL,
	`data_emissao` text NOT NULL,
	`mes_referencia` text NOT NULL,
	`ano_referencia` text NOT NULL,
	`valor_aluguel` real NOT NULL,
	`valor_agua` real DEFAULT 0 NOT NULL,
	`valor_luz` real DEFAULT 0 NOT NULL,
	`valor_iptu` real DEFAULT 0 NOT NULL,
	`valor_juros` real DEFAULT 0 NOT NULL,
	`valor_total` real NOT NULL,
	`observacoes` text,
	`pago` integer DEFAULT false NOT NULL,
	`data_pagamento` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`inquilino_id`) REFERENCES `inquilinos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`imovel_id`) REFERENCES `imoveis`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`proprietario_id`) REFERENCES `proprietarios`(`id`) ON UPDATE no action ON DELETE no action
);
