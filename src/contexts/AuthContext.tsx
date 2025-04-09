'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  admin: boolean;
  planoId: string;
  trocarSenhaNoProximoLogin: boolean;
}

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const verificarAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUsuario(data);
          
          // Verificar se o usuário precisa trocar a senha
          if (data.trocarSenhaNoProximoLogin) {
            router.push('/trocar-senha');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    verificarAuth();
  }, [router]);

  const login = async (email: string, senha: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao fazer login');
      }

      const data = await response.json();
      setUsuario(data.usuario);
      
      // Verificar se o usuário precisa trocar a senha
      if (data.trocarSenha) {
        router.push('/trocar-senha');
      } else {
        router.push('/');  
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Falha ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      setUsuario(null);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
