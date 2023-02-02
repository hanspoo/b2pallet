import * as fs from 'fs';
import { Local, UnidadNegocio, dataSource } from '@flash-ws/core';
import { ClienteService } from './ClienteService';
import { firstSheetAsJSON } from './b2butils';
import { fixNombreLocal, ifDebug } from '@flash-ws/shared';

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

const repo = dataSource.getRepository(Local);

export class LocalesService {
  constructor(public unidadNegocio: UnidadNegocio) {}

  static async save(local: Local) {
    repo.save(local);
  }

  async crearLocalesNuevos(path: string): Promise<void> {
    if (!fs.existsSync(path)) {
      throw Error('Archivo no existe');
    }
    const stat = fs.statSync(path);

    if (stat.size === 0) {
      throw Error('Archivo vacio');
    }

    const json = firstSheetAsJSON(path);

    await this.crearLocalesNuevosFromJson(json);
  }

  async crearLocalesNuevosFromJson(json: Array<any>): Promise<void> {
    const cliente = await ClienteService.findById(
      this.unidadNegocio.cliente.id
    );
    const locales = await new ClienteService(cliente).findLocales();
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
        local.nombre = fixNombreLocal(tupla[1]);
        // local.unidad = this.unidadNegocio;

        nuevosIds.add(local.codigo);

        return local;
      })
      .filter((r) => !!r);

    // if (nuevos.length > 0) console.log(`Hay ${nuevos.length} locales nuevos`);

    this.unidadNegocio = await dataSource
      .getRepository(UnidadNegocio)
      .findOne({ where: { id: this.unidadNegocio.id } });

    nuevos.map((nuevo) => {
      // return repoLocal.save(nuevo);
      ifDebug(`Agregando local ${nuevo.nombre}`);
      this.unidadNegocio.locales.push(nuevo);
      // console.log(`creando local ${nuevo.nombre}`);
    });

    // await Promise.all(promesas);

    const repoUnidad = dataSource.getRepository(UnidadNegocio);
    try {
      await repoUnidad.save(this.unidadNegocio);
    } catch (error) {
      console.log('error al salvar unidad', error);
    }
  }
}
