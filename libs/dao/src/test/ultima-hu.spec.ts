import { dataSource } from '../lib/data-source';
import { OrdenCompra } from '../lib/entity/orden-compra.entity';
import { Pallet } from '../lib/entity/pallet.entity';
import { inicializarCencosud } from '../lib/inicializarCencosud';
import { ServicioPallets } from '../lib/ServicioPallets';
import { crearOrdenHelper } from '../lib/utils/crearOrdenHelper';

let orden: OrdenCompra;

beforeAll(async () => {
  await inicializarCencosud();
});
beforeEach(async () => {
  await dataSource.query('delete from pallet');
  await dataSource.getRepository(OrdenCompra).clear();
  orden = await crearOrdenHelper(1);
});
async function insertarPallet(hu: number, orden: OrdenCompra) {
  const p = new Pallet();
  p.hu = hu;
  p.ordenCompra = orden;
  p.local = orden.lineas[0].local;
  // console.log(p);

  return dataSource.getRepository(Pallet).save(p);
}

describe('ultima hu', () => {
  it('sin pallets, retorna 0', async () => {
    const s = new ServicioPallets();
    const hu = await s.ultimaHU();
    expect(hu).toBe(0);
  });
  it('un pallet con hu 1, retorna 1', async () => {
    await insertarPallet(1, orden);
    const s = new ServicioPallets();
    const hu = await s.ultimaHU();
    expect(hu).toBe(1);
  });
  it('lanza excepción con hu duplicada', async () => {
    async function f() {
      await insertarPallet(1, orden);
      await insertarPallet(1, orden);
    }

    expect(f()).rejects.toThrow();
  });
  it.skip('sin exception con hu diferente', async () => {
    const pallets = await dataSource.getRepository(Pallet).find({});
    expect(pallets.length).toBe(0);
    await insertarPallet(1, orden);
    await insertarPallet(2, orden);
  });
});
