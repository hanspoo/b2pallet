import { dataSource } from './data-source';
import { ICajaConsolidada, IPalletConsolidado } from '@flash-ws/api-interfaces';
import { fixNombreLocal } from '@flash-ws/shared';

export interface Resultado {
  palletId: number;
  numcajas: string;
  vol: string;
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
  protoAncho,
  protoAlto
  `;
  const queryRunner = await dataSource.createQueryRunner();
  const rows: Array<Resultado> = await queryRunner.manager.query(sql);
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
    }) => {
      const volPallet = protolargo * protoancho * protoalto;
      const c: IPalletConsolidado = {
        palletid,
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

interface CajaPura {
  peso: string;
  largo: string;
  ancho: string;
  alto: string;
  producto: string;
  codigo: string;
  codcenco: string;
}
export async function cajasPallet(
  palletId: number
): Promise<ICajaConsolidada[]> {
  const sql = `
  SELECT
     box."largo" AS largo,
     box."ancho" AS ancho,
     box."alto" AS alto,
     producto."peso" AS peso,
     producto."nombre" AS producto,
     producto."codigo" AS codigo,
     producto."codCenco" AS codCenco
FROM
     pallet INNER JOIN caja ON pallet."id" = caja."palletId"
     INNER JOIN linea_detalle ON caja."lineaId" = linea_detalle."id"
     INNER JOIN producto ON linea_detalle."productoId" = producto."id"
     INNER JOIN box ON producto."boxId" = box."id"
WHERE
     pallet.id = ${palletId}
  `;

  const queryRunner = await dataSource.createQueryRunner();
  const rows: Array<CajaPura> = await queryRunner.manager.query(sql);

  const array: Array<ICajaConsolidada> = rows.map(
    ({ peso, largo, ancho, alto, producto, codigo, codcenco }) => ({
      largo: parseFloat(largo),
      ancho: parseFloat(ancho),
      alto: parseFloat(alto),
      peso: parseFloat(peso),
      producto,
      codigo,
      codcenco,
    })
  );
  return array;
}
