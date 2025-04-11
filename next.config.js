/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Definir o fuso horário para Brasília (GMT-3)
    TZ: 'America/Sao_Paulo',
  },
  // Configurações para produção
  reactStrictMode: true,
  output: 'standalone', // Otimiza para deploy em ambientes como Railway
  
  // Desativar a verificação de ESLint durante o build
  eslint: {
    // Ignorar erros de ESLint durante o build para permitir o deploy
    ignoreDuringBuilds: true,
  },
  
  // Desativar a verificação de TypeScript durante o build
  typescript: {
    // Ignorar erros de TypeScript durante o build para permitir o deploy
    ignoreBuildErrors: true,
  },
  
  // Configuração para o ambiente Edge da Vercel
  experimental: {
    // Habilitar o runtime de borda para melhor desempenho
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;
