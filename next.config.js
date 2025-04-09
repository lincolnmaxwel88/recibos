/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Definir o fuso horário para Brasília (GMT-3)
    TZ: 'America/Sao_Paulo',
  },
  // Configurações para produção
  reactStrictMode: true,
  output: 'standalone', // Otimiza para deploy em ambientes como Railway
  swcMinify: true,      // Minificação mais eficiente
};

module.exports = nextConfig;
