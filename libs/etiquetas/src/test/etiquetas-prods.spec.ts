import fs from 'fs';

import {
  inicializarCencosud,
  crearOrdenHelper,
  OrdenCompra,
  dataSource,
  ProtoPallet,
} from '@flash-ws/dao';

import { Distribuir, Ordenar } from '@flash-ws/api-interfaces';
import { EtiquetasService } from '../lib/EtiquetasService';
import { ServicioPalletNuevo } from '../lib/ServicioPalletNuevo';

/**
 * Dos procesos:
 * 1.- Preparamos una estructura de datos que tenga lo que necesito imprimir
 * 2.- Con esta estructura genera un pdf.
 */

let ordenUnaCaja: OrdenCompra;
let ordenDosCajas: OrdenCompra;
beforeAll(async () => {
  await inicializarCencosud();
  ordenUnaCaja = await crearOrdenHelper();
  ordenDosCajas = await crearOrdenHelper(2);
  const protos = await dataSource
    .getRepository(ProtoPallet)
    .find({ relations: ['box'] });
  if (!protos) throw Error('No hay proto pallets');
  const opciones = {
    proto: protos[0],
    nextHU: 1,
    ordenar: Ordenar.PESO,
    distribuir: Distribuir.HORIZONTAL,
  };

  await new ServicioPalletNuevo(ordenUnaCaja.id).crearPallets(opciones);
  await new ServicioPalletNuevo(ordenDosCajas.id).crearPallets(opciones);
});
describe('etiquetas', () => {
  it('genera pallet imprimible a partir de base de datos', async () => {
    const service = new EtiquetasService(ordenUnaCaja);
    const array = await service.etiquetasProductos(1);
    expect(array.length).toBe(1);
  });
  it('valida posicion los datos generados', async () => {
    const service = new EtiquetasService(ordenUnaCaja);
    const array = await service.etiquetasProductos(1);
    expect(array[0].posicion).toBe('1 de 1');
  });
  it('todos los campos con datos', async () => {
    const service = new EtiquetasService(ordenUnaCaja);
    const array = await service.etiquetasProductos(1);
    expect(array[0].codCenco).toBeTruthy();
    expect(array[0].producto).toBeTruthy();
    expect(array[0].posicion).toBeTruthy();
  });
  it('orden con dos cajas, cambia posición', async () => {
    const service = new EtiquetasService(ordenDosCajas);
    const array = await service.etiquetasProductos(2);
    expect(array[0].posicion).toBe('1 de 2');
    expect(array[1].posicion).toBe('2 de 2');
  });
  it('genera el pdf a partir de las etiquetas', async () => {
    const service = new EtiquetasService(ordenUnaCaja);
    const datos = await service.etiquetasProductos(1);
    const path = await service.genPdfProductos(datos);
    expect(fs.existsSync(path)).toBe(true);
  });
});
