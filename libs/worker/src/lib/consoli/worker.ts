import { LineaConsolidada } from './LineaConsolidada';
import { EstadoLinea } from '@flash-ws/api-interfaces';

export function calcularEstado(lc: LineaConsolidada) {
  const INITIAL: Record<EstadoLinea, number> = {
    Nada: 0,
    Multiple: 0,
    Aprobada: 0,
    Rechazada: 0,
    Pendiente: 0,
  };

  const estados = lc.lineas
    .map((linea) => linea.estado)
    .reduce((acc, iter) => {
      acc[iter] = acc[iter] + 1;
      return acc;
    }, INITIAL);

  const activos = Object.keys(estados)
    .filter((estado) => estados[estado] > 0)
    .map((estado) => estado as EstadoLinea);

  if (activos.length > 1) return EstadoLinea.Multiple;
  if (activos.length === 0) throw Error('No hay estados en lineas');

  return activos[0];
}
