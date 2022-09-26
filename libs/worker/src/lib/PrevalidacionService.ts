import * as fs from 'fs';

import { dataSource, Producto, UnidadNegocio } from '@flash-ws/dao';
import { fieldMap, firstSheetAsJSON } from './b2butils';

const repoProd = dataSource.getRepository(Producto);

export class PrevalidacionService {
  constructor(public unidadNegocio: UnidadNegocio) {}

  async validarExcel(path: string): Promise<string[]> {
    if (!fs.existsSync(path)) {
      throw Error('Archivo no existe');
    }
    const stat = fs.statSync(path);

    if (stat.size === 0) {
      throw Error('Archivo vacio');
    }

    const lineas = firstSheetAsJSON(path);
    const idsCodigosCenco = lineas.reduce((acc, iter) => {
      const codCenco = iter[fieldMap['codCenco']];
      acc[codCenco] = 1;
      return acc;
    }, {});

    const ids = Object.keys(idsCodigosCenco);

    async function existeCodCenco(codCenco: string) {
      const prod = await repoProd.findOne({ where: { codCenco } });
      return prod === null ? codCenco : null;
    }

    const promesas = ids.map((codCenco) => existeCodCenco(codCenco));

    const invalidos = await Promise.all(promesas);
    return invalidos.filter((cod) => cod !== null);
  }
}
