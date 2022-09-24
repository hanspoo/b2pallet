import * as fs from 'fs';
import { Local, UnidadNegocio } from '@flash-ws/dao';
import { ClienteService } from './ClienteService';
import { firstSheetAsJSON } from './b2butils';
import { LockNotSupportedOnGivenDriverError } from 'typeorm';

const fieldMap = {
  codLocal: 'Cód. Local Destino',
  nombreLocal: 'Local Destino',
  codCenco: 'Cód. Cencosud',
  cantidad: 'Empaques Pedidos',
};

/**
 * El principal asunto es que los locales los consideraremos como globales al cliente
 * a pesar de estar creados en una unidad de negocio en particular.
 */

export class LocalesService {
  constructor(public unidadNegocio: UnidadNegocio) {}

  async crearLocalesNuevos(path: string): Promise<void> {
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

    this.crearLocalesNuevosFromJson(json);
  }

  async crearLocalesNuevosFromJson(json: Array<any>): Promise<void> {
    const cliente = this.unidadNegocio.cliente;
    const locales = new ClienteService(cliente).findLocales();
    const localesExistentesDelCliente = locales.map((local) => local.codigo);

    const tuplas: Array<[string, string]> = json.map((row) => {
      const codigo = row[fieldMap['codLocal']] as string;
      const nombre = row[fieldMap['nombreLocal']] as string;
      return [codigo, nombre];
    });

    const existeLocalEnCliente = (codigo: string) => {
      return !!localesExistentesDelCliente.find((cod) => cod === codigo);
    };

    const nuevosIds = new Set<string>();

    const nuevos = tuplas
      .filter((tupla) => !existeLocalEnCliente(tupla[0]))

      .map((tupla) => {
        if (nuevosIds.has(tupla[0])) return undefined;
        const local = new Local();

        local.codigo = tupla[0];
        local.nombre = tupla[1];

        nuevosIds.add(local.codigo);

        return local;
      })
      .filter((r) => !!r);

    nuevos.forEach((nuevo) => {
      // console.log(`Creando local ${nuevo.codigo}`);

      nuevo.unidad = this.unidadNegocio;
      this.unidadNegocio.locales.push(nuevo);
    });
  }
}
