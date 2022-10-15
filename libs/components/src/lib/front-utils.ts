import { Box, Producto } from '@flash-ws/dao';

export function formatNumber(x: any) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function comparaVigencia(a: Producto, b: Producto) {
  const x = a.vigente ? 1 : 0;
  const y = b.vigente ? 1 : 0;

  return x - y;
}

export function fmtMedida(n: number) {
  return n / 10;
}

export function volumen(box: Box) {
  const { largo, ancho, alto } = box;
  return largo * ancho * alto;
}
