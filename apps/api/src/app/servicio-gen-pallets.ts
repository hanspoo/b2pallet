import {
  dataSource,
  OrdenCompra,
  ServicioPallets,
  Pallet,
  ProtoPallet,
  consolidaPallets,
} from '@flash-ws/dao';
import { PalletRobot } from '@flash-ws/robot';

async function genPallets(
  id: string,
  protoID: number,
  nextHU: number
): Promise<any[]> {
  const repo = dataSource.getRepository(OrdenCompra);
  const ordenes = await repo.find({
    where: { id },
    relations: ['lineas'],
  });
  if (ordenes.length !== 1) return [400, `Orden ${id} no encontrada`];

  const orden = ordenes[0];

  let hu = nextHU;
  if (!hu) {
    const s = new ServicioPallets();
    hu = await s.ultimaHU();
    hu++;
  }

  const repoPallets = dataSource.getRepository(Pallet);

  async function borrarPalletsActuales() {
    const pallets = await repoPallets.find({
      where: { ordenCompraId: orden.id },
    });
    await repoPallets.remove(pallets);
  }
  await borrarPalletsActuales();

  const robot = new PalletRobot(orden);
  const proto = await dataSource
    .getRepository(ProtoPallet)
    .findOne({ where: { id: protoID }, relations: { box: true } });
  orden.pallets = await robot.generarPallets(proto);

  await dataSource.getRepository(Pallet).save(orden.pallets);

  const pallets = await consolidaPallets(id);

  return [200, pallets];
}
