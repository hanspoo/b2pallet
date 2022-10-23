import * as xlsx from 'xlsx';
import * as crypto from 'crypto';
import { templateLine } from './lineaJson';
import { Linea } from '../lib/types';

export class FixtureBuilder {
  data: Array<Linea> = [];

  save(): string {
    const tmpName = crypto.randomBytes(6).toString('hex');
    const path = `/tmp/flash-${tmpName}.xls`;

    const workSheet = xlsx.utils.json_to_sheet(this.data);
    const workBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workBook, workSheet, 'OrdenCompra');
    xlsx.writeFile(workBook, path);

    return path;
  }
  getTemplate(args?: Partial<Linea>): Linea {
    return { ...templateLine, ...args };
  }
  addLine(linea: Linea) {
    this.data.push(linea);
  }
}
