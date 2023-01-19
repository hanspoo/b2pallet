import * as xlsx from 'xlsx';
import { Linea } from '../types';

export class ExcelLoader {
  load(path: string): Array<Linea> {
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

    return json;
  }
}
