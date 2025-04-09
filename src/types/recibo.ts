export interface Recibo {
  id: string;
  usuarioId: string;
  inquilinoId: string;
  imovelId: string;
  proprietarioId: string;
  dataEmissao: string;
  mesReferencia: string;
  anoReferencia: string;
  valorAluguel: number;
  valorAgua: number;
  valorLuz: number;
  valorIptu: number;
  valorJuros: number;
  valorTotal: number;
  observacoes?: string | null;
  pago: boolean;
  dataPagamento?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Novos campos para o recibo
  proximoReajuste?: string | null;
  formaReajuste?: string | null;
  vencimentoContrato?: string | null;
  tipoAluguel?: 'Comercial' | 'Residencial' | 'Comercial/Residencial' | null;
  vencimento?: string | null;
  codigoLocatario?: string | null;
  numeroRecibo?: string | null;
  
  // Campos adicionais para valores específicos
  valorCorrMont?: number | null;
  valorJuridico?: number | null;
  valorBonificacao?: number | null;
  valorAbatimento?: number | null;
  valorIRF?: number | null;
}
