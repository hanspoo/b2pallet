import {
  inicializarCencosud,
  obtainToken,
  dataSource,
  Cliente,
} from '@flash-ws/dao';

beforeAll(async () => {
  await inicializarCencosud();
});

const cliente = {
  nombre: 'CENCOSUD RETAIL S.A.',
  identLegal: 'C001',
  unidades: [
    {
      nombre: 'Sisa',
      locales: [{ codigo: 'N524', nombre: '185 -SISA-LINARES-JANUARIO-ESP' }],
    },
  ],
  empresa: { id: 1, nombre: 'b2pallet', identLegal: '123456789' },
};

describe('prueba creador de ordenes con json', () => {
  it('crear cliente desde json', async () => {
    const repoCliente = dataSource.getRepository(Cliente);
    const c = await repoCliente.save(cliente);
    expect(c.unidades.length).toBe(1);
  });
});
