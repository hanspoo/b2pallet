import {
  QuestionOutlined,
  CheckOutlined,
  CloseOutlined,
  PauseOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Box, Producto } from '@flash-ws/dao';

export function formatNumber(x: any) {
  if (typeof x === 'undefined') return '-1';
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

export const estados: Record<string, any> = {
  Nada: QuestionOutlined,
  Aprobada: CheckOutlined,
  Rechazada: CloseOutlined,
  Pendiente: PauseOutlined,
  Multiple: WarningOutlined,
};

export const colores: Record<string, string> = {
  Nada: 'yellow',
  Aprobada: 'green',
  Rechazada: 'red',
  Pendiente: 'cyan',
  Multiple: 'magenta',
};
