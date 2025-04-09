import { db } from '../index';

export async function addReciboFields() {
  try {
    console.log('Iniciando migração: Adicionando novos campos à tabela de recibos...');
    
    // Verificar se as colunas já existem
    const tableInfo = await db.all('PRAGMA table_info(recibos)');
    const columns = tableInfo.map((col: any) => col.name);
    
    // Adicionar as novas colunas se não existirem
    const columnsToAdd = [
      { name: 'proximo_reajuste', type: 'TEXT' },
      { name: 'forma_reajuste', type: 'TEXT', default: "'Anual'" },
      { name: 'vencimento_contrato', type: 'TEXT' },
      { name: 'tipo_aluguel', type: 'TEXT', default: "'Residencial'" },
      { name: 'vencimento', type: 'TEXT' },
      { name: 'codigo_locatario', type: 'TEXT' },
      { name: 'numero_recibo', type: 'TEXT' }
    ];
    
    for (const column of columnsToAdd) {
      if (!columns.includes(column.name)) {
        const defaultValue = column.default ? `DEFAULT ${column.default}` : '';
        await db.run(`ALTER TABLE recibos ADD COLUMN ${column.name} ${column.type} ${defaultValue}`);
        console.log(`Coluna ${column.name} adicionada à tabela recibos`);
      } else {
        console.log(`Coluna ${column.name} já existe na tabela recibos`);
      }
    }
    
    console.log('Migração concluída: Novos campos adicionados à tabela de recibos');
    return true;
  } catch (error) {
    console.error('Erro ao adicionar novos campos à tabela de recibos:', error);
    return false;
  }
}
