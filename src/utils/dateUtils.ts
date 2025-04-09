/**
 * Utilitários para manipulação de datas no sistema
 * Todas as datas são tratadas no fuso horário de Brasília (GMT-3)
 */

// Configuração do fuso horário para Brasil/Brasília
const TIMEZONE = 'America/Sao_Paulo';

/**
 * Retorna a data atual no fuso horário de Brasília
 * @returns Data atual
 */
export const getCurrentDate = (): Date => {
  // Cria uma data com o fuso horário local do servidor
  const now = new Date();
  
  // Ajusta para o fuso horário de Brasília
  const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
  
  return brazilTime;
};

/**
 * Formata uma data para o formato ISO (yyyy-mm-dd)
 * @param date Data a ser formatada
 * @returns String no formato ISO
 */
export const formatToISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Formata uma data para o formato brasileiro (dd/mm/yyyy)
 * @param date Data a ser formatada
 * @returns String no formato brasileiro
 */
export const formatToBrazilianDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

/**
 * Converte uma string de data no formato ISO (yyyy-mm-dd) para o formato brasileiro (dd/mm/yyyy)
 * @param isoDate String de data no formato ISO
 * @returns String no formato brasileiro
 */
export const isoToBrazilianDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) return '';
  
  try {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erro ao converter data ISO para formato brasileiro:', error);
    return isoDate;
  }
};

/**
 * Converte uma string de data no formato brasileiro (dd/mm/yyyy) para o formato ISO (yyyy-mm-dd)
 * @param brDate String de data no formato brasileiro
 * @returns String no formato ISO
 */
export const brazilianToISODate = (brDate: string | null | undefined): string => {
  if (!brDate) return '';
  
  try {
    const [day, month, year] = brDate.split('/');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Erro ao converter data brasileira para formato ISO:', error);
    return brDate;
  }
};

/**
 * Aplica máscara de data no formato brasileiro (dd/mm/yyyy)
 * @param value Valor a ser mascarado
 * @returns String com a máscara aplicada
 */
export const applyDateMask = (value: string): string => {
  // Remove caracteres não numéricos
  let maskedValue = value.replace(/\D/g, '');
  
  if (maskedValue.length > 0) {
    // Aplica máscara dd/mm/yyyy
    maskedValue = maskedValue.replace(/^(\d{2})(\d)/, '$1/$2');
    maskedValue = maskedValue.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    maskedValue = maskedValue.substring(0, 10);
  }
  
  return maskedValue;
};
