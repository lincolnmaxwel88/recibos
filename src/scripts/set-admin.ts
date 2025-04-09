import { db } from '../db';
import { usuarios } from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

async function main() {
  try {
    console.log('Iniciando configuração de administrador...');
    
    // Verificar se já existe algum usuário
    const usuariosExistentes = await db.select().from(usuarios);
    
    if (usuariosExistentes.length === 0) {
      // Criar um usuário administrador se não existir nenhum
      console.log('Nenhum usuário encontrado. Criando usuário administrador...');
      
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash('admin123', salt);
      
      await db.insert(usuarios).values({
        id: uuidv4(),
        nome: 'Administrador',
        email: 'admin@sistema.com',
        senha: senhaHash,
        admin: true,
        ativo: true,
        planoId: 'empresarial', // Atribuir o plano empresarial ao administrador
        trocarSenhaNoProximoLogin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('Usuário administrador criado com sucesso!');
      console.log('Email: admin@sistema.com');
      console.log('Senha: admin123');
    } else {
      // Atualizar todos os usuários existentes para terem privilégios de administrador
      console.log(`${usuariosExistentes.length} usuário(s) encontrado(s). Atualizando permissões...`);
      
      for (const usuario of usuariosExistentes) {
        await db.update(usuarios)
          .set({ 
            admin: true,
            planoId: 'empresarial', // Atribuir o plano empresarial ao administrador
            updatedAt: new Date().toISOString()
          })
          .where(eq(usuarios.id, usuario.id));
        
        console.log(`Usuário ${usuario.email} atualizado para administrador com plano empresarial.`);
      }
    }
    
    console.log('Configuração de administrador concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao configurar administrador:', error);
    process.exit(1);
  }
}

main();
