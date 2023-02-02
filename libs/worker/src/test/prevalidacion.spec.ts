/*

La prevalidación es que todos los productos deben existir

*/

import {
  Cliente,
  dataSource,
  inicializarCencosud,
  UnidadNegocio,
} from '@flash-ws/core';
import { OrdenService } from '../lib/OrdenService';
import { PrevalidacionService } from '../lib/PrevalidacionService';
import { FixtureBuilder } from './XLSFixtureBuilder';

let cliente: Cliente;
let sisa: UnidadNegocio;

beforeAll(async () => {
  cliente = await inicializarCencosud();
  sisa = cliente.unidades.find((u) => (u.nombre = 'Sisa'));
});

describe('Pre validar b2b', () => {
  describe('productos inválidos', () => {
    it('debe enviar error si producto no existe', async () => {
      const response = await new PrevalidacionService(sisa).validarExcel(
        'fixtures/orden-una-linea-prod-invalido.xls'
      );
      expect(response.error).toBe(true);
    });
    it('productos validos debe haber cero', async () => {
      const response = await new PrevalidacionService(sisa).validarExcel(
        'fixtures/orden-una-linea.xls'
      );
      expect(response.error).toBe(false);
    });
  });
  describe('ordenes duplicadas', () => {
    it.skip('debe enviar error si producto no existe', async () => {
      const service = new FixtureBuilder();
      service.addLine(service.getTemplate({ 'Número de Orden': 123 }));
      const path = service.save();

      await new OrdenService(sisa).crearOrden(path);

      // Recargar la entidad unidad
      sisa = await dataSource
        .getRepository(UnidadNegocio)
        .findOne({ where: { id: sisa.id }, relations: { ordenes: true } });

      const response = await new PrevalidacionService(sisa).validarExcel(path);
      expect(response.ordenesDuplicadas.length).toBe(1);
    });
  });
});
