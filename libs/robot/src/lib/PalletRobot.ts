import { EstadoLinea } from '@flash-ws/api-interfaces';
import {
  Box,
  Caja,
  LineaDetalle,
  OrdenCompra,
  Pallet,
  ProtoPallet,
} from '@flash-ws/dao';

export class PalletRobot {
  generarPallets(proto: ProtoPallet): Pallet[] {
    const porLocal: Record<number, LineaDetalle[]> = this.orden.lineas
      .filter((linea) => linea.estado === EstadoLinea.Aprobada)
      .reduce((acc: Record<number, LineaDetalle[]>, iter: LineaDetalle) => {
        const localID = iter.localId;
        if (!localID)
          throw Error(`La línea ${JSON.stringify(iter)} no tiene id de local`);
        const lineas = acc[localID];
        if (lineas) {
          lineas.push(iter);
        } else {
          acc[localID] = [iter];
        }
        return acc;
      }, {});

    const res: Pallet[] = Object.keys(porLocal).reduce(
      (acc: Pallet[], iter) => {
        const pallets = this.generarPalletsPorLocal(parseInt(iter), proto);
        acc = [...acc, ...pallets];
        return acc;
      },
      []
    );

    return res;
  }
  generarPalletsPorLocal(idLocal: number, proto: ProtoPallet): Pallet[] {
    const pallets: Pallet[] = [];
    const cajas: Caja[] = this.orden.lineas
      .filter((linea) => linea.localId === idLocal)
      .reduce((acc: Caja[], iter: LineaDetalle) => {
        acc = [...acc, ...iter.cajas];
        return acc;
      }, []);

    for (let i = 0; i < cajas.length; i++) {
      const caja = cajas[i];
      if (pallets.length === 0) {
        pallets.push(this.crearPallet(proto, idLocal));
      }
      let pallet = pallets[pallets.length - 1];
      if (!agregar(pallet, caja)) {
        pallet = this.crearPallet(proto, idLocal);
        pallets.push(pallet);
        if (!agregar(pallet, caja)) {
          throw Error(
            `No se pudo agregar caja ${caja.linea.producto.nombre} en pallet`
          );
        }
      }
    }

    return pallets;
  }
  constructor(public orden: OrdenCompra) {}
  crearPallet(proto: ProtoPallet, idLocal: number): Pallet {
    const p = new Pallet();
    p.box = Box.clone(proto.box);
    p.cajas = [];
    p.localId = idLocal;
    p.ordenCompra = this.orden;
    return p;
  }
}

export function agregar(pallet: Pallet, caja: Caja): boolean {
  if (cabeCajaEnPallet(pallet, caja)) {
    pallet.cajas.push(caja);
    return true;
  }
  return false;
}
function cabeCajaEnPallet(pallet: Pallet, caja: Caja) {
  const volUsado = Pallet.volumenUsado(pallet);
  const cabe = volUsado + caja.volumen() <= pallet.box.volumen;
  if (!cabe)
    console.log(
      `No cabe la caja ${volUsado} + ${caja.volumen()} <= ${
        pallet.box.volumen
      };`
    );
  return cabe;
}
