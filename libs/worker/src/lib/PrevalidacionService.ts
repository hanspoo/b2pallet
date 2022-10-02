import * as fs from 'fs';

import { dataSource, Producto, UnidadNegocio } from '@flash-ws/dao';
import { fieldMap, firstSheetAsJSON } from './b2butils';
import { COL_NUM_ORDEN, Linea } from './types';

const repoProd = dataSource.getRepository(Producto);

export type ResultadoPrevalidacion = {
  error: boolean;
  productosNoEncontrados: Array<string>;
  ordenesDuplicadas: Array<string>;
};

export class PrevalidacionService {
  constructor(public unidadNegocio: UnidadNegocio) {}

  async validarExcel(path: string): Promise<ResultadoPrevalidacion> {
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

    const resultadoPromesas = await Promise.all(promesas);
    const productosNoEncontrados = resultadoPromesas.filter(
      (cod) => cod !== null
    );

    const ordenesDuplicadas = this.ordenesDuplicadas(lineas);

    const res: ResultadoPrevalidacion = {
      error: productosNoEncontrados.length > 0,
      ordenesDuplicadas,
      productosNoEncontrados,
    };

    return res;
  }

  // El mismo número de orden no debe existir en la unidad de negocio
  ordenesDuplicadas(lineas: Linea[]): string[] {
    const INITIAL: Record<string, Array<Linea>> = {};
    const ordenGroup = lineas.reduce((acc, iter) => {
      const numOrden = iter[COL_NUM_ORDEN];
      let lote = acc[numOrden];
      if (!lote) {
        lote = [];
      }

      lote = lote.concat(iter);
      acc[numOrden] = lote;

      return acc;
    }, INITIAL);

    // Validamos que ninguna de las ordenes no existan previamente
    // en la unidad de negocio
    const numerosOrden = Object.keys(ordenGroup);

    const existentes = this.unidadNegocio.ordenes.filter(
      (orden) => numerosOrden.indexOf(orden.numero) !== -1
    );

    return existentes.map((orden) => orden.numero);
  }
}
