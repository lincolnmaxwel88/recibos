import { Usuario } from '@/types/usuario';
import { UsuarioRepository } from '@/repositories/usuarioRepository';

const usuarioRepository = new UsuarioRepository();

export const UsuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    return await usuarioRepository.findAll();
  },

  getById: async (id: string): Promise<Usuario | null> => {
    return await usuarioRepository.findById(id);
  },

  getByEmail: async (email: string): Promise<Usuario | null> => {
    return await usuarioRepository.findByEmail(email);
  },

  create: async (data: { nome: string; email: string; senha: string; admin?: boolean; trocarSenhaNoProximoLogin?: boolean }): Promise<Usuario> => {
    // Verificar se já existe um usuário com este email
    const usuarioExistente = await usuarioRepository.findByEmail(data.email);
    if (usuarioExistente) {
      throw new Error('Já existe um usuário com este email');
    }

    return await usuarioRepository.create(data);
  },

  update: async (id: string, data: Partial<Omit<Usuario, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Usuario> => {
    // Verificar se o usuário existe
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Se estiver atualizando o email, verificar se já existe outro usuário com este email
    if (data.email && data.email !== usuario.email) {
      const usuarioExistente = await usuarioRepository.findByEmail(data.email);
      if (usuarioExistente) {
        throw new Error('Já existe um usuário com este email');
      }
    }

    // Se estiver atualizando a senha e o usuário estava com flag para trocar senha, desativar após a troca
    if (data.senha && usuario.trocarSenhaNoProximoLogin) {
      data.trocarSenhaNoProximoLogin = false;
    }
    
    const usuarioAtualizado = await usuarioRepository.update(id, data);
    if (!usuarioAtualizado) {
      throw new Error('Falha ao atualizar o usuário');
    }
    
    return usuarioAtualizado;
  },

  delete: async (id: string): Promise<boolean> => {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    return await usuarioRepository.delete(id);
  },

  login: async (email: string, senha: string): Promise<{ usuario: Omit<Usuario, 'senha'>, token: string, trocarSenha: boolean }> => {
    const usuario = await usuarioRepository.validateCredentials(email, senha);
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }
    
    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      throw new Error('Usuário desativado. Entre em contato com o administrador.');
    }

    // Criar um token JWT usando a biblioteca jose
    const { SignJWT } = await import('jose');
    const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_aqui';
    
    const token = await new SignJWT({
      email: usuario.email,
      nome: usuario.nome,
      admin: usuario.admin,
      trocarSenhaNoProximoLogin: usuario.trocarSenhaNoProximoLogin
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(usuario.id)
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Não retornar a senha
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    return {
      usuario: usuarioSemSenha as Omit<Usuario, 'senha'>,
      token,
      trocarSenha: usuario.trocarSenhaNoProximoLogin
    };
  },

  validateToken: async (token: string): Promise<Omit<Usuario, 'senha'> | null> => {
    try {
      // Importar a biblioteca jose para verificar o token JWT
      const { jwtVerify } = await import('jose');
      const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_aqui';
      
      // Verificar o token JWT
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      
      if (!payload.sub) {
        console.error('Token sem sub (ID do usuário)');
        return null;
      }
      
      // Buscar o usuário pelo ID contido no token
      const usuarioId = payload.sub as string;
      const usuario = await usuarioRepository.findById(usuarioId);
      
      if (!usuario) {
        console.error('Usuário não encontrado com ID:', usuarioId);
        return null;
      }
      
      // Verificar se o usuário está ativo
      if (!usuario.ativo) {
        console.error('Usuário inativo:', usuarioId);
        return null;
      }
      
      // Não retornar a senha
      const { senha: _, ...usuarioSemSenha } = usuario;
      
      console.log('Usuário autenticado com sucesso:', usuarioId);
      return usuarioSemSenha as Omit<Usuario, 'senha'>;
    } catch (error) {
      console.error('Erro ao validar token JWT:', error);
      return null;
    }
  },

  ativarUsuario: async (id: string): Promise<Usuario> => {
    const usuario = await usuarioRepository.ativarUsuario(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    return usuario;
  },
  
  desativarUsuario: async (id: string): Promise<Usuario> => {
    const usuario = await usuarioRepository.desativarUsuario(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    return usuario;
  }
};
