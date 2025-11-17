/**
 * Formata uma data do banco de dados sem conversão de timezone.
 * O banco armazena datas em UTC, mas queremos exibi-las como se fossem locais.
 */
export function formatDateFromDB(dateString: string, formatStr: string = "dd/MM/yyyy 'às' HH:mm"): string {
  // Remove o timezone da string para evitar conversão automática
  const dateWithoutTZ = dateString.replace(/[+-]\d{2}:\d{2}$/, '').replace(/Z$/, '');
  const date = new Date(dateWithoutTZ);
  
  // Formata manualmente para evitar dependências de bibliotecas de timezone
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  if (formatStr.includes('HH:mm')) {
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  }
  
  return `${day}/${month}/${year}`;
}
