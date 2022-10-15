import {
  OrdenCompra,
  dataSource,
  UnidadNegocio,
  Box,
  Producto,
  Local,
  LineaDetalle,
} from '@flash-ws/dao';
import * as crypto from 'node:crypto';

export async function crearOrdenHelper(): Promise<OrdenCompra> {
  const sisa = await dataSource
    .getRepository(UnidadNegocio)
    .findOne({ where: { id: 1 } });

  if (!sisa) throw Error('Debe estar creada unidad de negocio para usar esto');

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
