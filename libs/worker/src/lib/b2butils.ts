import * as xlsx from 'xlsx';
import { Linea } from './types';

export const fieldMap = {
  codLocal: 'Cód. Local Destino',
  nombreLocal: 'Local Destino',
  codCenco: 'Cód. Cencosud',
  cantidad: 'Empaques Pedidos',
  numOrden: 'Número de Orden',
  emision: 'Fecha Emisión',
  entrega: 'Fecha Entrega',
};

export function firstSheetAsJSON(path: string): Array<Linea> {
  let workbook;
  try {
    workbook = xlsx.readFile(path);
  } catch (error) {
    throw Error('Archivo no es excel');
  }
  const sheet_name_list = workbook.SheetNames;
  const hoja = workbook.Sheets[sheet_name_list[0]];

  const json = xlsx.utils.sheet_to_json(hoja);
  if (!Array.isArray(json)) throw Error('Planilla inválida');
  if (json.length === 0) throw Error('Planilla inválida');

  const row = json[0];
  if (!row[fieldMap['codCenco']]) throw Error('Planilla faltan datos críticos');
  if (!row[fieldMap['codLocal']]) throw Error('Planilla faltan datos críticos');
  if (!row[fieldMap['cantidad']]) throw Error('Planilla faltan datos críticos');
  if (!row[fieldMap['numOrden']]) throw Error('Planilla faltan datos críticos');

  return json;
}
