'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Clock from './Clock';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Não renderizar a navbar nas páginas de login e registro
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Itens de navegação básicos para todos os usuários
  const baseNavItems = [
    { label: 'Início', href: '/' },
    { label: 'Proprietários', href: '/proprietarios' },
    { label: 'Imóveis', href: '/imoveis' },
    { label: 'Inquilinos', href: '/inquilinos' },
    { label: 'Recibos', href: '/recibos' },
  ];
  
  // Itens de navegação apenas para administradores
  const adminNavItems = [
    { label: 'Usuários', href: '/usuarios' },
    { label: 'Planos', href: '/planos' },
  ];
  
  // Combinar os itens de navegação com base no perfil do usuário
  const navItems = usuario?.admin 
    ? [...baseNavItems, ...adminNavItems]
    : baseNavItems;

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-white font-bold text-xl">
                Sistema de Recibos
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center">
            {/* Componente de relógio mostrando data e hora atual */}
            <div className="mr-6 flex items-center">
              <Clock />
            </div>
            
            {usuario && (
              <div className="flex items-center">
                <span className="text-gray-300 mr-4">
                  Olá, {usuario.nome}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu móvel */}
      {isMenuOpen && (
        <div className="md:hidden">
          {/* Relógio na versão móvel */}
          <div className="px-4 py-2 border-b border-gray-700">
            <Clock />
          </div>
          
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {usuario && (
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">
                    {usuario.nome}
                  </div>
                  <div className="text-sm font-medium leading-none text-gray-400 mt-1">
                    {usuario.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
