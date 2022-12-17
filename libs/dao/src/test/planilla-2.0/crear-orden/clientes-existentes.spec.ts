import { randomBytes } from 'crypto';
import { ProcesadorPlanilla } from '../../../lib/parser-2.0/ProcesadorPlanilla';
import { OrdenCreator } from '../../../lib/parser-2.0/OrdenCreator';
import { dataSource } from '../../../lib/data-source';
import { Empresa } from '../../../lib/entity/auth/empresa.entity';
import { Cliente } from '../../../lib/entity/cliente.entity';
import { UnidadNegocio } from '../../../lib/entity/unidad-negocio.entity';
import { inicializarCencosud } from '../../../lib/inicializarCencosud';
import { config } from '../columnas-parametricas/config-campos-cenco';

import {
  LineBuilder,
  SheetBuilder,
} from '../columnas-parametricas/hoja-builder';

let empresa: Empresa;
beforeAll(async () => {
  await inicializarCencosud();
  empresa = await dataSource
    .getRepository(Empresa)
    .findOne({ where: { nombre: 'b2pallet' } });
});
describe('crear unidades de negocio ordenes', () => {
  describe('cliente existente', () => {
    const repoCli = dataSource.getRepository(Cliente);
    it('cliente existente, debe crear la unidad de negocio', async () => {
      await repoCli.save(
        repoCli.create({ identLegal: 'C001', nombre: 'Cliente 01' })
      );
      const nombre = randomBytes(10).toString('hex');

      const l1 = new LineBuilder().withUnidad(nombre).build();
      const hoja = new SheetBuilder().addLines(l1).build();

      const procesador = new ProcesadorPlanilla(config);
      const result = await procesador.procesar(hoja);
      await new OrdenCreator(empresa).fromProcesador(result);

      const unidad = await dataSource
        .getRepository(UnidadNegocio)
        .findOne({ where: { nombre } });

      expect(unidad).toBeTruthy();
    });
    it('cliente nuevo existente, debe crear la unidad de negocio', async () => {
      const nombre = randomBytes(10).toString('hex');

      const l1 = new LineBuilder().withUnidad(nombre).build();
      const hoja = new SheetBuilder().addLines(l1).build();

      const procesador = new ProcesadorPlanilla(config);
      const result = await procesador.procesar(hoja);
      await new OrdenCreator(empresa).fromProcesador(result);

      const unidad = await dataSource
        .getRepository(UnidadNegocio)
        .findOne({ where: { nombre } });

      expect(unidad).toBeTruthy();
    });
  });
});

// ('debe crear la unidad de negocio para cliente existente, unidad nombre existente');
