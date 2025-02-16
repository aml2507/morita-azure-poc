export function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return 'No disponible';
  
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
} 