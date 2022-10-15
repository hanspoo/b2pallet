import * as crypto from 'node:crypto';
import { dataSource } from './data-source';
import { Box } from './entity/box.entity';
import { LineaDetalle } from './entity/linea-detalle.entity';
import { Local } from './entity/local.entity';
import { OrdenCompra } from './entity/orden-compra.entity';
import { Producto } from './entity/producto.entity';
import { UnidadNegocio } from './entity/unidad-negocio.entity';

export async function crearOrdenHelper(): Promise<OrdenCompra> {
  const sisa = await dataSource
    .getRepository(UnidadNegocio)
    .findOne({ where: { id: 1 } });
  const box = new Box();

  box.largo = 490;
  box.ancho = 400;
  box.alto = 110;

  const p = new Producto();

  p.nombre = 'Bandeja Diseño Ely Chica';
  p.codigo = 'CT-01005430';
  p.peso = 1950;
  p.codCenco = '1651844';
  p.vigente = true;
  p.box = box;

  const producto = await dataSource.getRepository(Producto).save(p);

  console.trace('esto ne debería estar pasando');

  const orden = new OrdenCompra();
  orden.unidad = sisa;
  orden.numero = '5575426472';
  orden.emision = '15-09-2022';
  orden.entrega = '22-09-2022';

  let local = new Local();
  local.nombre = crypto.randomBytes(12).toString('hex');
  local.codigo = local.nombre;
  local.unidad = sisa;

  local = await dataSource.getRepository(Local).save(local);

  const linea = new LineaDetalle();
  linea.cantidad = 1;
  linea.producto = producto;
  linea.local = local;
  orden.lineas = [linea];

  return await dataSource.getRepository(OrdenCompra).save(orden);
}
