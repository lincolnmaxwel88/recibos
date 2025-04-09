FROM node:20-alpine

WORKDIR /app

# Criar diretório persistente para o SQLite
RUN mkdir -p /data && chmod 777 /data

# Copiar arquivos de configuração
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci

# Copiar o código-fonte
COPY . .

# Construir a aplicação
RUN npm run build

# Expor a porta que o Next.js usa
EXPOSE 3000

# Iniciar a aplicação
CMD ["npm", "start"]
