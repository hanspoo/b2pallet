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
  console.log('1');
  const repo = dataSource.getRepository(OrdenCompra);
  console.log('1.1');
  const ordenes = await repo.find({
    where: { id },
    relations: ['lineas'],
  });
  console.log('2');
  if (ordenes.length !== 1) return [400, `Orden ${id} no encontrada`];

  const orden = ordenes[0];

  let hu = nextHU;
  if (!hu) {
    const s = new ServicioPallets();
    hu = await s.ultimaHU();
    hu++;
  }

  const repoPallets = dataSource.getRepository(Pallet);
  console.log('3');

  async function borrarPalletsActuales() {
    console.log('3.1');
    const pallets = await repoPallets.find({
      where: { ordenCompraId: orden.id },
    });
    console.log('3.2');

    await repoPallets.remove(pallets);
  }
  await borrarPalletsActuales();

  console.log('4');
  const robot = new PalletRobot(orden);
  const proto = await dataSource
    .getRepository(ProtoPallet)
    .findOne({ where: { id: protoID }, relations: { box: true } });
  console.log('4');
  orden.pallets = await robot.generarPallets(proto);
  console.log('hay orden.pallets:' + orden.pallets.length);

  await dataSource.getRepository(Pallet).save(orden.pallets);

  const pallets = await consolidaPallets(id);
  console.log('7');

  return [200, pallets];
}
