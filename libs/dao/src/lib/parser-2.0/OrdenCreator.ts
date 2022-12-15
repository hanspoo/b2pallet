import {
  dataSource,
  LineaDetalle,
  Local,
  Producto,
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
  static async fromProcesador({
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
    let clientePersistente = await repoCliente.findOne({
      where: { identLegal },
    });
    if (!clientePersistente) {
      cli.unidades = unidades.map((nombre) =>
        repoUnidad.create({
          nombre,
          locales: this.localesParaUnidad(nombre, locales),
        })
      );
      clientePersistente = await repoCliente.save(cli);
    }

    const ordenesCreadas: Array<OrdenCompra> = [];

    for (let i = 0; i < ordenes.length; i++) {
      const orden = ordenes[i];
      orden.cliente = clientePersistente;
      orden.lineas = lineas.map((lc) => {
        const linea = repoLinea.create({ cantidad: lc.cantidad });
        return linea;
      });
      ordenesCreadas.push(orden as OrdenCompra);
    }

    repoCliente.save(clientePersistente);

    return { ordenes: ordenesCreadas, errores: [] };
  }
  static localesParaUnidad(unidad: string, locales: LocalCrudo[]): Local[] {
    const repoLocal = dataSource.getRepository(Local);

    return locales
      .filter((lc) => lc.unidad === unidad)
      .map((lc) => {
        return repoLocal.create({ codigo: lc.codigo, nombre: lc.nombre });
      });
  }

  static async erroresProductos(lineas: LineaCruda[]): Promise<string[]> {
    const repoProducto = dataSource.getRepository(Producto);
    const prods = new Set<string>(lineas.map((l) => l.codProdProveedor));
    const array = Array.from(prods);
    const errores = [];
    for (let i = 0; i < array.length; i++) {
      const prod = array[i];
      const p = await repoProducto.findOne({ where: { codigo: prod } });
      if (p === null) errores.push(`Producto ${prod} no encontrado`);
    }
    return errores;
  }
}
