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

type RespuestaCrear = {
  orden: OrdenCompra;
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
      console.log(`Archivo no existe ${path}`);
      throw Error('Archivo no existe');
    }
    const stat = fs.statSync(path);

    if (stat.size === 0) {
      console.log(`Archivo vacio ${path}`);
      throw Error('Archivo vacio');
    }

    const json = firstSheetAsJSON(path);

    await new LocalesService(this.unidadNegocio).crearLocalesNuevosFromJson(
      json
    );
    this.locales = new ClienteService(this.unidadNegocio.cliente).findLocales();

    const orden = await this.ordenFromJSON(json);
    orden.unidad = this.unidadNegocio;

    repo.save(orden);

    return { orden, status: this.statusLineas };
  }

  async ordenFromJSON(json: any[]): Promise<OrdenCompra> {
    const oc = new OrdenCompra();

    oc.numero = json[0][fieldMap['numOrden']];
    oc.emision = json[0][fieldMap['emision']];
    oc.entrega = json[0][fieldMap['entrega']];

    oc.lineas = await Promise.all(
      json.map((row, i) => {
        console.log(i);
        return this.rowToLinea(oc, row);
      })
    );

    return oc;
  }
  async rowToLinea(oc: OrdenCompra, row: any): Promise<LineaDetalle> {
    // console.log(row);

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
