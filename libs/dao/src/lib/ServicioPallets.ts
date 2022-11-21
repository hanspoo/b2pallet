import { dataSource } from './data-source';
import { ICajaConsolidada, IPalletConsolidado } from '@flash-ws/api-interfaces';
import { fixNombreLocal, ifDebug } from '@flash-ws/shared';
import { CajaPura } from './CajaPura';
import { ServicioCajas } from './ServicioCajas';

export interface Resultado {
  palletId: number;
  numcajas: string;
  vol: string;
  hu: number;
  peso: string;
  protolargo: number;
  protoancho: number;
  protoalto: number;
  palletid: number;
  nombrelocal: string;
}

export async function consolidaPallets(
  ordenId: string
): Promise<IPalletConsolidado[]> {
  const sql = `
  SELECT
  count(*) AS numCajas,
  sum(box.largo*box.ancho*box.alto) AS vol,
  sum(producto.peso) AS peso,
  box_A."largo" AS protoLargo,
  box_A."ancho" AS protoAncho,
  box_A."alto" AS protoAlto,
  pallet."id" AS palletId,
  pallet.hu AS hu,
  local."nombre" AS nombreLocal
FROM
  "linea_detalle" linea_detalle INNER JOIN "caja" caja ON linea_detalle."id" = caja."lineaId"
  INNER JOIN "pallet" pallet ON caja."palletId" = pallet."id"
  INNER JOIN "local" local ON pallet."localId" = local."id"
  INNER JOIN  box box_A ON pallet."boxId" = box_A."id"
  INNER JOIN "producto" producto ON linea_detalle."productoId" = producto."id"
  INNER JOIN "box" box ON producto."boxId" = box."id"
WHERE
  pallet."ordenCompraId" = '${ordenId}'
GROUP BY
  palletid,
  nombreLocal,
  protoLargo,
  hu,
  protoAncho,
  protoAlto
  `;
  const queryRunner = dataSource.createQueryRunner();
  console.log(`consolida pallets\n ${sql}`);
  const rows: Array<Resultado> = await queryRunner.manager.query(sql);
  queryRunner.release();
  return rows.map(
    ({
      numcajas,
      vol,
      peso,
      palletid,
      nombrelocal,
      protolargo,
      protoancho,
      protoalto,
      hu,
    }) => {
      const volPallet = protolargo * protoancho * protoalto;
      const c: IPalletConsolidado = {
        palletid,
        hu,
        numcajas: parseInt(numcajas),
        vol: parseInt(vol),
        peso: parseInt(peso),
        nombrelocal: fixNombreLocal(nombrelocal),
        porcUso: (parseFloat(vol) * 100) / volPallet,
      };
      return c;
    }
  );
}

export async function cajasPallet(
  palletId: number
): Promise<ICajaConsolidada[]> {
  return ServicioCajas.cajasPallet(palletId);
}

export class ServicioPallets {
  async ultimaHU(): Promise<number> {
    const queryRunner = dataSource.createQueryRunner();
    const sql = 'select max(hu) as maxhu from pallet';
    const res = await queryRunner.manager.query(sql);
    await queryRunner.release();

    return Promise.resolve(res[0].maxhu || 0);
  }
}
