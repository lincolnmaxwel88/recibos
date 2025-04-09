'use client';

import { useState, useEffect } from 'react';

export default function Clock() {
  const [dateTime, setDateTime] = useState<string>('');
  
  useEffect(() => {
    // Função para atualizar a data e hora
    const updateDateTime = () => {
      const now = new Date();
      
      // Formatar a data no padrão brasileiro (dd/mm/yyyy)
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      
      // Formatar a hora (hh:mm:ss)
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      // Combinar data e hora
      const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
      
      setDateTime(formattedDateTime);
    };
    
    // Atualizar imediatamente
    updateDateTime();
    
    // Configurar intervalo para atualizar a cada segundo
    const intervalId = setInterval(updateDateTime, 1000);
    
    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="text-white text-sm">
      <span className="font-medium">{dateTime}</span>
      <span className="ml-1 text-xs">(GMT-3)</span>
    </div>
  );
}
