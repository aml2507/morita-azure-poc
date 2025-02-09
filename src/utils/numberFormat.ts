export function formatearNumero(numero: number): string {
  // Redondear a 2 decimales
  const numeroRedondeado = Math.round(numero * 100) / 100;
  
  // Convertir a string y separar parte entera y decimal
  const [parteEntera, parteDecimal = '00'] = numeroRedondeado.toString().split('.');
  
  // Formatear parte entera con puntos cada 3 dígitos
  const enteraFormateada = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Asegurar que la parte decimal tenga 2 dígitos
  const decimalFormateada = parteDecimal.padEnd(2, '0').slice(0, 2);
  
  // Unir con coma
  return `${enteraFormateada},${decimalFormateada}`;
} 