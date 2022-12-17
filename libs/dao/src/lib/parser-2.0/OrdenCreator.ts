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
      relations: ['unidades'],
      where: { identLegal },
    });
    if (cliente) {
      const nuevas = agregarUnidades(cliente, unidades);
      nuevas.forEach((u) => cliente.unidades.push(u));
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
function agregarUnidades(
  cliente: Cliente,
  unidadesNuevas: string[]
): UnidadNegocio[] {
  const nuevas = unidadesNuevas.filter((nombre) => {
    return !existeUnidad(cliente, nombre);
  });
  return nuevas.map((s) => {
    const u = new UnidadNegocio();
    u.nombre = s;
    return u;
  });
}
function existeUnidad(cliente: Cliente, nombre: string) {
  const re = new RegExp(nombre);

  return cliente.unidades.find((u) => re.test(u.nombre));
}
