import { Distribuir, Ordenar } from '@flash-ws/api-interfaces';
import {
  OrdenCompra,
  Pallet,
  dataSource,
  ProtoPallet,
  ultimaHUCliente,
} from '@flash-ws/dao';
import { PalletRobot, PalletRobotConfig } from '@flash-ws/robot';

type OpcionesGenerar = {
  proto: ProtoPallet;
  nextHU: number;
  ordenar: Ordenar;
  distribuir: Distribuir;
};

export class ServicioPalletNuevo {
  constructor(public idOrden: string) {}

  async crearPallets(options: OpcionesGenerar): Promise<Pallet[]> {
    const repo = dataSource.getRepository(OrdenCompra);
    const orden = await repo.findOne({
      where: { id: this.idOrden },
      relations: [
        'lineas',
        'lineas.cajas',
        'lineas.cajas.linea',
        'lineas.cajas.linea.producto',
        'lineas.cajas.linea.producto.box',
        'lineas.producto',
      ],
    });
    if (!orden) {
      throw Error(`Orden de compra ${this.idOrden} no encontrada`);
    }

    const { proto, nextHU, ordenar, distribuir } = options;

    let hu = nextHU;
    if (!hu) {
      hu = await ultimaHUCliente(orden.cliente.id);
      hu++;
    }

    const repoPallets = dataSource.getRepository(Pallet);

    const borrarPalletsActuales = async () => {
      const pallets = await repoPallets.find({
        where: { ordenCompraId: this.idOrden },
      });
      await repoPallets.remove(pallets);
    };
    await borrarPalletsActuales();

    const robotConfig: PalletRobotConfig = { ordenar, distribuir };
    const robot = new PalletRobot(orden, robotConfig);
    orden.pallets = await robot.generarPallets(proto);
    orden.pallets.forEach((pallet) => (pallet.hu = hu++));

    return dataSource.getRepository(Pallet).save(orden.pallets);
  }
}
