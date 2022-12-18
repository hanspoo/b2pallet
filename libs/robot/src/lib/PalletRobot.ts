import { Distribuir, EstadoLinea, Ordenar } from '@flash-ws/api-interfaces';
import {
  Box,
  Caja,
  LineaDetalle,
  OrdenCompra,
  Pallet,
  ProtoPallet,
} from '@flash-ws/dao';
import { ifDebug } from '@flash-ws/shared';

export type PalletRobotConfig = {
  ordenar?: Ordenar;
  distribuir?: Distribuir;
};

export class PalletRobot {
  constructor(public orden: OrdenCompra, public config?: PalletRobotConfig) {}

  async generarPallets(proto: ProtoPallet): Promise<Pallet[]> {
    ifDebug('Generando pallets para orden ' + this.orden.id);
    if (this.orden.lineas.length === 0) throw Error('No hay líneas de detalle');

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

    ifDebug(
      `Hay ${Object.keys(porLocal).length} locales con productos aprobados`
    );

    // const cajas = await ServicioCajas.cajasOrden(this.orden.id);
    // if (cajas.length === 0) throw Error('No hay cajas en la orden');

    const res: Pallet[] = Object.keys(porLocal).reduce(
      (acc: Pallet[], iter: any) => {
        const pallets = this.generarPalletsPorLocal(
          parseInt(iter),
          proto,
          porLocal[iter]
        );
        acc = [...acc, ...pallets];
        return acc;
      },
      []
    );

    return res;
  }
  generarPalletsPorLocal(
    idLocal: number,
    proto: ProtoPallet,
    lineas: Array<LineaDetalle>
  ): Pallet[] {
    if (!proto) throw Error('Debe entregar el proto pallet');
    // const pallets: Pallet[] = [];
    const cajas = lineas.reduce((acc: Array<Caja>, iter: LineaDetalle) => {
      return acc.concat(iter.cajas);
    }, []);

    if (cajas.length === 0) throw Error('No hay cajas para local ' + idLocal);
    const ordenar = this.config?.ordenar || Ordenar.PESO;

    const ordenadas =
      ordenar === Ordenar.PESO ? ordenarPeso(cajas) : ordenarVolumen(cajas);

    const volTotal: number = ordenadas.reduce((acc, iter) => {
      return acc + iter.volumen();
    }, 0);

    const numPallets = volTotal / proto.volumen;
    if (process.env['DEBUG']) console.log(`se esperan ${numPallets} pallets`);

    const pallets: Pallet[] = [];
    for (let index = 0; index < numPallets; index++) {
      pallets.push(this.crearPallet(proto, idLocal));
    }

    let palletActual = 0;

    const distribuir = this.config?.distribuir || Distribuir.VERTICAL;
    if (distribuir === Distribuir.HORIZONTAL) {
      ordenadas.forEach((caja) => {
        pallets[palletActual++ % pallets.length].cajas.push(caja);
      });
      return pallets;
    }

    for (let i = 0; i < ordenadas.length; i++) {
      const caja = cajas[i];
      let pallet = pallets[palletActual];
      if (!agregar(pallet, caja)) {
        palletActual++;
        pallet = pallets[palletActual];
        ifDebug(
          `No había espacio, agregando pallet vol, ${pallet.box.volumen}`
        );
        // pallets.push(pallet);
        if (!agregar(pallet, caja)) {
          throw Error(
            `No se pudo agregar caja ${
              caja.id
            } en pallet nuevo, vol caja: ${caja.volumen()}, vol pallet: ${pallet.volumen()}`
          );
        }
      }
    }

    return pallets;
  }
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
    ifDebug(
      `No cabe la caja ${volUsado} + ${caja.volumen()} <= ${
        pallet.box.volumen
      };`
    );
  return cabe;
}

function ordenarPeso(cajas: Caja[]): Caja[] {
  return cajas.sort((a, b) => {
    return b.linea.producto.peso - a.linea.producto.peso;
  });
}

function ordenarVolumen(cajas: Caja[]): Caja[] {
  return cajas.sort((a, b) => {
    console.log(
      `Comparand volumen: ${b.linea.producto.box.volumen} - ${a.linea.producto.box.volumen}`
    );
    return b.linea.producto.box.volumen - a.linea.producto.box.volumen;
  });
}
// function volumen(caja: ICajaConsolidada) {
//   return caja.largo * caja.ancho * caja.alto;
// }
// function cajaFromConsolidada(caja: ICajaConsolidada): Caja {
//   const c = new Caja();
//   c.id = caja.id;
//   return c;
// }
