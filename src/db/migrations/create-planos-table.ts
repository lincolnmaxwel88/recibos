import { db } from '@/db';
import { planos } from '@/db/schema';

export async function createPlanosTable() {
  try {
    console.log('Criando tabela de planos...');
    
    // Verificar se a tabela já existe
    const tableExists = await db.select().from(planos).limit(1).catch(() => null);
    
    if (tableExists === null) {
      // Criar a tabela
      await db.run(`
        CREATE TABLE IF NOT EXISTS planos (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          descricao TEXT NOT NULL,
          limite_imoveis INTEGER NOT NULL,
          limite_inquilinos INTEGER NOT NULL,
          limite_proprietarios INTEGER NOT NULL,
          permite_relatorios_avancados INTEGER NOT NULL DEFAULT 0,
          permite_modelos_personalizados INTEGER NOT NULL DEFAULT 0,
          permite_multiplos_usuarios INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
      
      // Inserir planos padrão
      await db.insert(planos).values([
        {
          id: 'basico',
          nome: 'Básico',
          descricao: 'Plano básico com recursos essenciais',
          limiteImoveis: 20,
          limiteInquilinos: 20,
          limiteProprietarios: 10,
          permiteRelatoriosAvancados: false,
          permiteModelosPersonalizados: false,
          permiteMultiplosUsuarios: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'profissional',
          nome: 'Profissional',
          descricao: 'Plano intermediário com recursos avançados',
          limiteImoveis: 50,
          limiteInquilinos: 50,
          limiteProprietarios: 25,
          permiteRelatoriosAvancados: true,
          permiteModelosPersonalizados: true,
          permiteMultiplosUsuarios: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'empresarial',
          nome: 'Empresarial',
          descricao: 'Plano completo com recursos ilimitados',
          limiteImoveis: 9999,
          limiteInquilinos: 9999,
          limiteProprietarios: 9999,
          permiteRelatoriosAvancados: true,
          permiteModelosPersonalizados: true,
          permiteMultiplosUsuarios: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
      
      console.log('Tabela de planos criada com sucesso!');
    } else {
      console.log('Tabela de planos já existe.');
    }
  } catch (error) {
    console.error('Erro ao criar tabela de planos:', error);
    throw error;
  }
}
