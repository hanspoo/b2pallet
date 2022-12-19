import { dataSource } from '../data-source';
import { Empresa } from '../entity/auth/empresa.entity';
import { Cliente } from '../entity/cliente.entity';
import { LineaDetalle } from '../entity/linea-detalle.entity';
import { Local } from '../entity/local.entity';
import { OrdenCompra } from '../entity/orden-compra.entity';
import { Producto } from '../entity/producto.entity';
import { UnidadNegocio } from '../entity/unidad-negocio.entity';
import { LineaCruda } from './ProcesadorPlanilla';

export async function crearOrdenes(
  empresa: Empresa,
  cliente: Cliente,
  ordenes: Partial<OrdenCompra>[],
  lineas: LineaCruda[]
) {
  const repoOrdenes = dataSource.getRepository(OrdenCompra);
  const repoEmpresa = dataSource.getRepository(Empresa);
  const repoCliente = dataSource.getRepository(Cliente);
  const repoLinea = dataSource.getRepository(LineaDetalle);
  const repoUnidad = dataSource.getRepository(UnidadNegocio);

  const ordenesCreadas: Array<OrdenCompra> = [];

  // {where: {id: empresa.id}}, {relations:["productos"]}}
  const e = await repoEmpresa.findOne({
    where: { id: empresa.id },
    relations: ['productos'],
  });

  if (!e) throw Error(`La empresa ${empresa.id} no fue encontrada`);

  if (!e.productos) throw Error('La empresa no tiene los productos definidos');
  const findByCodigo: Record<string, Producto> = e.productos.reduce(
    (acc: Record<string, Producto>, iter: Producto) => {
      acc[iter.codigo] = iter;
      return acc;
    },
    {}
  );
  const locs: Local[] = cliente.unidades.reduce((acc: any, iter: any) => {
    acc = [...acc, ...iter.locales];
    return acc;
  }, []);

  const findByLocal: Record<string, Local> = locs.reduce(
    (acc: any, iter: any) => {
      acc[iter.codigo] = iter;
      return acc;
    },
    {}
  );

  for (let i = 0; i < ordenes.length; i++) {
    console.log('Creando orden ' + i);

    const orden = repoOrdenes.create(ordenes[i]);
    orden.lineas = lineas
      .filter((linea) => linea.numOrden === orden.numero)
      .map(({ cantidad, codLocal, codProdCliente, codProducto }) => {
        console.log('Creando líneas');
        const producto = findByCodigo[codProducto];
        if (!producto)
          throw Error(
            `Producto ${codProducto} no encontrado en empresa ${empresa.nombre}`
          );
        const local = findByLocal[codLocal];
        if (!local)
          throw Error(
            `Local ${codLocal} no encontrado en cliente ${cliente.nombre}`
          );

        const linea = repoLinea.create({ cantidad, producto, local });
        console.log('insertando linea', linea);
        return linea;
      });

    ordenesCreadas.push(orden as OrdenCompra);
  }

  return ordenesCreadas;
}
