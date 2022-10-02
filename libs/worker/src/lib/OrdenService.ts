import * as fs from 'fs';

import {
  dataSource,
  LineaDetalle,
  Local,
  OrdenCompra,
  Producto,
  UnidadNegocio,
} from '@flash-ws/dao';
import { ClienteService } from './ClienteService';
import { fieldMap, firstSheetAsJSON } from './b2butils';
import { LocalesService } from './LocalesService';
import { COL_NUM_ORDEN, Linea } from './types';
import { In } from 'typeorm';

type RespuestaCrear = {
  ordenes: Array<OrdenCompra>;
  status: Array<string>;
};

const repo = dataSource.getRepository(OrdenCompra);

export class OrdenService {
  static findAll(): Promise<Array<OrdenCompra>> {
    return repo.find({ relations: { unidad: true } });
  }

  statusLineas: Array<string> = [];
  locales: Array<Local>;

  constructor(public unidadNegocio: UnidadNegocio) {}

  async crearOrden(path: string): Promise<RespuestaCrear> {
    if (!fs.existsSync(path)) {
      throw Error('Archivo no existe');
    }
    const stat = fs.statSync(path);

    if (stat.size === 0) {
      throw Error('Archivo vacio');
    }

    const json = firstSheetAsJSON(path);

    await new LocalesService(this.unidadNegocio).crearLocalesNuevosFromJson(
      json
    );
    this.locales = await new ClienteService(
      this.unidadNegocio.cliente
    ).findLocales();

    // Agrupamos las líneas por orden de compra

    const INITIAL: Record<string, Array<Linea>> = {};

    const ordenGroup = json.reduce((acc, iter) => {
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

    // const deLaUnidad = await dataSource.getRepository(OrdenCompra).find({
    //   where: { unidad: this.unidadNegocio },
    // });
    // const existentes = deLaUnidad.filter(
    //   (orden) => numerosOrden.indexOf(orden.numero) !== -1
    // );

    // const existentes = await dataSource
    //   .getRepository(OrdenCompra)
    //   .manager.createQueryBuilder(OrdenCompra, 'orden')
    //   .where('orden.numero IN (:...numeros)', { numeros: numerosOrden })
    //   .andWhere('orden.unidad = :unidad', this.unidadNegocio)
    //   .getMany();

    if (existentes.length > 0) {
      throw Error('Hay ordenes duplicadas');
    }

    const promesas = Object.values(ordenGroup).map(async (loteLineas) => {
      const orden = await this.ordenFromJSON(loteLineas);
      orden.unidad = this.unidadNegocio;

      return repo.save(orden);
    });

    const ordenes = await Promise.all(promesas);

    return { ordenes, status: this.statusLineas };
  }

  async ordenFromJSON(json: any[]): Promise<OrdenCompra> {
    const oc = new OrdenCompra();

    oc.numero = json[0][fieldMap['numOrden']];
    oc.emision = json[0][fieldMap['emision']];
    oc.entrega = json[0][fieldMap['entrega']];

    oc.lineas = await Promise.all(
      json.map((row, i) => {
        return this.rowToLinea(oc, row);
      })
    );

    return oc;
  }
  async rowToLinea(oc: OrdenCompra, row: any): Promise<LineaDetalle> {
    const l = new LineaDetalle();
    l.ordenCompra = oc;

    const codCenco = row[fieldMap['codCenco']];
    const codLocal = row[fieldMap['codLocal']] as string;
    const cantidad = row[fieldMap['codCenco']];

    l.cantidad = cantidad;
    /**
     * Si viene un local que no está registrado, se debe agregar.
     */
    const localFromDB = this.locales.find((local) => local.codigo === codLocal);

    if (!localFromDB) {
      throw Error('Todos los locales deben existir');
    }

    l.producto = await this.findProducto(codCenco);
    l.local = localFromDB;

    return l;
  }
  async findProducto(codCenco: string): Promise<Producto> {
    return dataSource.getRepository(Producto).findOneBy({ codCenco });
  }
}
