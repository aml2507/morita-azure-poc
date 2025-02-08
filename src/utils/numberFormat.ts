export const formatearNumero = (numero: number): string => {
  return new Intl.NumberFormat('es-AR').format(numero);
}; 