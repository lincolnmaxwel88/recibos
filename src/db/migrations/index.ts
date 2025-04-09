import { createUsuariosTable } from './create-usuarios-table';
import { addAtivoColumn } from './add-ativo-column';
import { addAdminColumn } from './add-admin-column';
import { addTrocarSenhaColumn } from './add-trocar-senha-column';
import { addReciboFields } from './add-recibo-fields';
import { addValoresAdicionais } from './add-valores-adicionais';
import { createPlanosTable } from './create-planos-table';
import { addPlanoColumn } from './add-plano-column';
import { addUsuarioIdToTables } from './add-usuario-id-to-tables';

export async function runMigrations() {
  try {
    console.log('Iniciando migrações...');
    
    // Executar todas as migrações em sequência
    await createPlanosTable();
    await createUsuariosTable();
    await addAtivoColumn();
    await addAdminColumn();
    await addTrocarSenhaColumn();
    await addReciboFields();
    await addValoresAdicionais();
    await addPlanoColumn();
    await addUsuarioIdToTables();
    
    console.log('Todas as migrações foram executadas com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao executar migrações:', error);
    throw error;
  }
}
