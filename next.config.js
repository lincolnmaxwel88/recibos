/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Definir o fuso horário para Brasília (GMT-3)
    TZ: 'America/Sao_Paulo',
  },
  // Outras configurações do Next.js
  reactStrictMode: true,
};

module.exports = nextConfig;
