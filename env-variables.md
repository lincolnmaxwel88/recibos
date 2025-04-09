# Variáveis de Ambiente para o Sistema de Gestão

Este arquivo documenta as variáveis de ambiente necessárias para o funcionamento do sistema em produção.

## Variáveis Obrigatórias

- `JWT_SECRET`: Chave secreta para assinatura dos tokens JWT (deve ser uma string longa e aleatória)
- `NODE_ENV`: Ambiente de execução (development, production)

## Variáveis Opcionais

- `SEED_DATABASE`: Defina como "true" para executar o seed do banco de dados durante o deploy inicial
- `DATABASE_PATH`: Caminho personalizado para o arquivo do banco de dados SQLite (padrão: /data/sqlite.db em produção)

## Exemplo de Configuração no Railway

Ao configurar seu projeto no Railway, você precisará adicionar as seguintes variáveis:

```
JWT_SECRET=sua_chave_secreta_muito_longa_e_aleatoria
NODE_ENV=production
SEED_DATABASE=true  # Apenas no primeiro deploy, depois mude para "false"
```
