import { dataSource } from './data-source';
import { ConsolidadoCajas } from './ConsolidadoCajas';
import { IPalletConsolidado } from '@flash-ws/api-interfaces';

interface Resultado {
  numcajas: string;
  vol: string;
  peso: string;
  protolargo: number;
  protoancho: number;
  protoalto: number;
  palletid: number;
  nombrelocal: string;
}

export function dao(): string {
  return 'dao';
}

export async function palletsCajas(id: number): Promise<ConsolidadoCajas[]> {
  const sql = `
    SELECT
    box."largo" AS largo,
    box."ancho" AS ancho,
    box."alto" AS alto,
    caja."id" AS cajaId,
    linea_detalle."estado" AS estado,
    pallet."id" AS palletId,
    linea_detalle."productoId" AS productoId,
    linea_detalle."localId" AS localId,
    producto."nombre" AS nombreProducto,
    local."nombre" AS nombreLocal,
    producto."peso" AS peso,
    producto."codigo" AS codigoProducto,
    producto."codCenco" AS codCenco
FROM
    "linea_detalle" linea_detalle INNER JOIN "caja" caja ON linea_detalle."id" = caja."lineaId"
    INNER JOIN "pallet" pallet ON caja."palletId" = pallet."id"
    INNER JOIN "local" local ON pallet."localId" = local."id"
    INNER JOIN "producto" producto ON linea_detalle."productoId" = producto."id"
    INNER JOIN "box" box ON producto."boxId" = box."id"
WHERE
    pallet."ordenCompraId" = ${id}    
    `;
  const queryRunner = await dataSource.createQueryRunner();
  return await queryRunner.manager.query(sql);
}

export async function consolidaPallets(
  ordenId: number
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
  pallet."ordenCompraId" = ${ordenId}
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
        numcajas: parseInt(numcajas),
        vol: parseInt(vol),
        peso: parseInt(peso),
        palletid,
        nombrelocal,
        porcUso: (parseFloat(vol) * 100) / volPallet,
      };
      return c;
    }
  );
}
