import { useSyncExternalStore } from 'react';
import {
  dataSource,
  Empresa,
  LineaDetalle,
  Local,
  ProductoService,
  UnidadNegocio,
} from '../..';
import { Cliente } from '../entity/cliente.entity';
import { OrdenCompra } from '../entity/orden-compra.entity';
import { LineaCruda, LocalCrudo, ResultadoProceso } from './ProcesadorPlanilla';

type ResultCrearOrdenes = {
  ordenes: Array<OrdenCompra>;
  errores: Array<string>;
};

export class OrdenCreator {
  constructor(public empresa: Empresa) {}
  async fromProcesador({
    ordenes,
    clientes,
    unidades,
    locales,
    lineas,
  }: ResultadoProceso): Promise<ResultCrearOrdenes> {
    // Creamos el cliente y pasamos un cliente persistido a la orden
    const errores = await this.erroresProductos(lineas);
    if (errores.length > 0) return { ordenes: [], errores };

    const cli = clientes[0];
    const identLegal = cli.identLegal;

    const repoCliente = dataSource.getRepository(Cliente);
    const repoLinea = dataSource.getRepository(LineaDetalle);
    const repoUnidad = dataSource.getRepository(UnidadNegocio);
    let cliente = await repoCliente.findOne({
      relations: ['unidades', 'unidades.locales'],
      where: { identLegal },
    });
    if (cliente) {
      const nuevas = unidadesNuevas(cliente, unidades);
      nuevas.forEach((u) => cliente.unidades.push(u));
      mezclarLocales(cliente, locales);
      cliente = await repoCliente.save(cliente);
    } else {
      cli.unidades = unidades.map((nombre) =>
        repoUnidad.create({
          nombre,
          locales: this.localesParaUnidad(nombre, locales),
        })
      );
      cliente = await repoCliente.save(cli);
    }

    const ordenesCreadas: Array<OrdenCompra> = [];

    for (let i = 0; i < ordenes.length; i++) {
      const orden = ordenes[i];
      orden.cliente = cliente;
      orden.lineas = lineas.map((lc) => {
        const linea = repoLinea.create({ cantidad: lc.cantidad });
        return linea;
      });
      ordenesCreadas.push(orden as OrdenCompra);
    }

    repoCliente.save(cliente);

    return { ordenes: ordenesCreadas, errores: [] };
  }
  localesParaUnidad(unidad: string, locales: LocalCrudo[]): Local[] {
    const repoLocal = dataSource.getRepository(Local);

    return locales
      .filter((lc) => lc.unidad === unidad)
      .map((lc) => {
        return repoLocal.create({ codigo: lc.codigo, nombre: lc.nombre });
      });
  }

  async erroresProductos(lineas: LineaCruda[]): Promise<string[]> {
    const service = new ProductoService(this.empresa);

    const prods = new Set<string>(lineas.map((l) => l.codProdProveedor));
    const array = Array.from(prods);
    const errores = [];
    for (let i = 0; i < array.length; i++) {
      const prod = array[i];
      const p = await service.findByCodigo(prod);
      if (p === null) errores.push(`Producto ${prod} no encontrado`);
    }
    return errores;
  }
}
function unidadesNuevas(
  cliente: Cliente,
  unidadesNuevas: string[]
): UnidadNegocio[] {
  const nuevas = unidadesNuevas.filter((nombre) => {
    return !existeUnidad(cliente, nombre);
  });
  return nuevas.map((s) => {
    const u = new UnidadNegocio();
    u.nombre = s;
    u.locales = [];
    return u;
  });
}
function existeUnidad(cliente: Cliente, nombre: string) {
  const re = new RegExp(nombre);

  return cliente.unidades.find((u) => re.test(u.nombre));
}
function mezclarLocales(cliente: Cliente, locales: LocalCrudo[]): void {
  const mapaUnidadLocal: Record<string, LocalCrudo[]> = locales.reduce(
    (acc, iter) => {
      const ele = acc[iter.unidad];
      if (ele) {
        acc[iter.unidad] = [...ele, iter];
      } else {
        acc[iter.unidad] = [iter];
      }
      return acc;
    },
    {}
  );

  console.log('cliente.unidades', cliente.unidades);

  const repoLocal = dataSource.getRepository(Local);

  Object.keys(mapaUnidadLocal).forEach((nombreUnidad) => {
    const unidad = cliente.unidades.find((u) => u.nombre === nombreUnidad);
    if (!unidad) throw Error(`La unidad ${unidad} debe existir a esta altura`);

    const locales = mapaUnidadLocal[nombreUnidad];
    locales.forEach((localPlanilla) => {
      const localActual = unidad.locales.find(
        ({ codigo }) => codigo === localPlanilla.codigo
      );
      if (localActual) return;
      console.log(`Agregando local ${localPlanilla.nombre}`);

      unidad.locales.push(
        repoLocal.create({
          codigo: localPlanilla.codigo,
          nombre: localPlanilla.nombre,
        })
      );
    });
  });
}
