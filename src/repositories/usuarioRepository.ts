import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Usuario } from '@/types/usuario';
import { PlanoId } from '@/types/plano';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export class UsuarioRepository {
  async findAll(): Promise<Usuario[]> {
    const result = await db.select().from(usuarios);
    // Garantir que planoId seja do tipo PlanoId
    return result.map(user => ({
      ...user,
      planoId: (user.planoId || 'basico') as PlanoId
    }));
  }

  async findById(id: string): Promise<Usuario | null> {
    const result = await db.select().from(usuarios).where(eq(usuarios.id, id));
    if (result.length === 0) return null;
    
    // Garantir que planoId seja do tipo PlanoId
    return {
      ...result[0],
      planoId: (result[0].planoId || 'basico') as PlanoId
    };
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const result = await db.select().from(usuarios).where(eq(usuarios.email, email));
    if (result.length === 0) return null;
    
    // Garantir que planoId seja do tipo PlanoId
    return {
      ...result[0],
      planoId: (result[0].planoId || 'basico') as PlanoId
    };
  }

  async create(data: { nome: string; email: string; senha: string; admin?: boolean; trocarSenhaNoProximoLogin?: boolean; planoId?: PlanoId }): Promise<Usuario> {
    const now = new Date();
    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(data.senha, salt);
    
    const novoUsuario: Usuario = {
      id: uuidv4(),
      nome: data.nome,
      email: data.email,
      senha: hashedSenha,
      planoId: data.planoId || 'basico' as PlanoId, // Definir plano padrão como 'basico'
      ativo: true,
      admin: data.admin !== undefined ? data.admin : false,
      trocarSenhaNoProximoLogin: data.trocarSenhaNoProximoLogin !== undefined ? data.trocarSenhaNoProximoLogin : false,
      createdAt: now,
      updatedAt: now
    };
    
    await db.insert(usuarios).values({
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      senha: novoUsuario.senha,
      planoId: novoUsuario.planoId,
      ativo: novoUsuario.ativo,
      admin: novoUsuario.admin,
      trocarSenhaNoProximoLogin: novoUsuario.trocarSenhaNoProximoLogin,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
    
    return novoUsuario;
  }

  async update(id: string, data: Partial<Omit<Usuario, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Usuario | null> {
    const usuario = await this.findById(id);
    if (!usuario) return null;
    
    const now = new Date();
    
    // Garantir que planoId seja do tipo PlanoId
    const planoIdAtualizado = data.planoId ? data.planoId as PlanoId : usuario.planoId;
    
    const updatedUsuario = {
      ...usuario,
      ...data,
      planoId: planoIdAtualizado,
      updatedAt: now
    };
    
    // Se a senha foi atualizada, precisamos criptografá-la
    if (data.senha) {
      const salt = await bcrypt.genSalt(10);
      updatedUsuario.senha = await bcrypt.hash(data.senha, salt);
    }
    
    await db.update(usuarios)
      .set({
        nome: updatedUsuario.nome,
        email: updatedUsuario.email,
        senha: updatedUsuario.senha,
        ativo: updatedUsuario.ativo,
        admin: updatedUsuario.admin,
        planoId: updatedUsuario.planoId, // Adicionando o campo planoId para atualização
        trocarSenhaNoProximoLogin: updatedUsuario.trocarSenhaNoProximoLogin,
        updatedAt: now.toISOString()
      })
      .where(eq(usuarios.id, id));
    
    return updatedUsuario;
  }

  async delete(id: string): Promise<boolean> {
    await db.delete(usuarios).where(eq(usuarios.id, id));
    return true;
  }

  async validateCredentials(email: string, senha: string): Promise<Usuario | null> {
    const usuario = await this.findByEmail(email);
    if (!usuario) return null;
    
    // Verificar se o usuário está ativo
    if (!usuario.ativo) return null;
    
    const isValid = await bcrypt.compare(senha, usuario.senha);
    if (!isValid) return null;
    
    // Garantir que planoId seja do tipo PlanoId
    return {
      ...usuario,
      planoId: (usuario.planoId || 'basico') as PlanoId
    };
  }

  async ativarUsuario(id: string): Promise<Usuario | null> {
    const usuario = await this.findById(id);
    if (!usuario) return null;
    
    const now = new Date();
    const updatedUsuario = {
      ...usuario,
      ativo: true,
      updatedAt: now
    };
    
    await db.update(usuarios)
      .set({
        ativo: true,
        updatedAt: now.toISOString()
      })
      .where(eq(usuarios.id, id));
    
    return updatedUsuario;
  }

  async desativarUsuario(id: string): Promise<Usuario | null> {
    const usuario = await this.findById(id);
    if (!usuario) return null;
    
    const now = new Date();
    const updatedUsuario = {
      ...usuario,
      ativo: false,
      updatedAt: now
    };
    
    await db.update(usuarios)
      .set({
        ativo: false,
        updatedAt: now.toISOString()
      })
      .where(eq(usuarios.id, id));
    
    return updatedUsuario;
  }
}
