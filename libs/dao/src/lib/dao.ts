import { dataSource } from './data-source';
import { ConsolidadoCajas } from './ConsolidadoCajas';
import { PalletConsolidado } from './PalletConsolidado';

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
): Promise<PalletConsolidado[]> {
  const sql = `
  select
	count(*) as numCajas,
	sum(box.largo * box.ancho * box.alto) as vol,
	sum(producto.peso) as peso,
	pallet.id as palletId,
	local.nombre as nombreLocal
from
	linea_detalle
inner join caja on
	linea_detalle.id = caja."lineaId"
inner join pallet on
	caja."palletId" = pallet.id
inner join local on
	pallet."localId" = local.id
inner join producto on
	linea_detalle."productoId" = producto.id
inner join box on
	producto."boxId" = box.id
where
	pallet."ordenCompraId" = ${ordenId}
group by
	palletid,
	nombreLocal  
  `;
  const queryRunner = await dataSource.createQueryRunner();
  return await queryRunner.manager.query(sql);
}
