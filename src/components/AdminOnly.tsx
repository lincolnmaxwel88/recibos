'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Componente que renderiza seu conteúdo apenas se o usuário atual for administrador
 * @param children Conteúdo a ser renderizado se o usuário for administrador
 * @param fallback Conteúdo opcional a ser renderizado se o usuário não for administrador
 */
export default function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { usuario } = useAuth();
  
  // Renderizar o conteúdo apenas se o usuário for administrador
  if (usuario?.admin) {
    return <>{children}</>;
  }
  
  // Caso contrário, renderizar o fallback (que por padrão é null, ou seja, não renderiza nada)
  return <>{fallback}</>;
}
