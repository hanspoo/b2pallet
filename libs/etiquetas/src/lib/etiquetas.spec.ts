import fs from 'fs';
import { ServicioPalletNuevo } from './ServicioPalletNuevo';
import {
  inicializarCencosud,
  crearOrdenHelper,
  OrdenCompra,
  dataSource,
  ProtoPallet,
} from '@flash-ws/dao';

import { EtiquetasService } from './EtiquetasService';
import { Distribuir, Ordenar } from '@flash-ws/api-interfaces';

/**
 * Dos procesos:
 * 1.- Preparamos una estructura de datos que tenga lo que necesito imprimir
 * 2.- Con esta estructura genera un pdf.
 */

let orden: OrdenCompra;
beforeAll(async () => {
  await inicializarCencosud();
  orden = await crearOrdenHelper();
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

  const pallets = await new ServicioPalletNuevo(orden.id).crearPallets(
    opciones
  );
  expect(pallets.length).toBe(1);
});
describe('etiquetas', () => {
  it('genera pallet imprimible a partir de base de datos', async () => {
    const service = new EtiquetasService(orden);
    const array = await service.etiquetasPallets();
    expect(array.length).toBe(1);
  });
  it('genera el pdf a partir de las etiquetas', async () => {
    const service = new EtiquetasService(orden);
    const etiPallets = await service.etiquetasPallets();
    const path = await service.genPdf(etiPallets);
    expect(fs.existsSync(path)).toBe(true);
  });
});
