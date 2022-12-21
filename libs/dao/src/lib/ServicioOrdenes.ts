import { IOrdenConsolidada } from '@flash-ws/api-interfaces';
import { Empresa } from '..';
import { dataSource } from './data-source';

// cajas: number;
// unidad: string;
// cliente: string;
// numero: string;
// id: string;
// emision: string;
// entrega: string;

export class ServicioOrdenes {
  constructor(public empresa: Empresa) {}

  async ordenes(): Promise<IOrdenConsolidada[]> {
    if (!this.empresa) throw Error('Este servicio require la empresa');
    const sql = `
    SELECT
    sum(linea_detalle."cantidad") AS cajas,
    cliente."nombre" AS cliente,
    orden_compra."numero" AS numero,
    orden_compra."id" AS id,
    orden_compra."emision" AS emision,
    orden_compra."entrega" AS entrega
FROM
    "orden_compra" orden_compra INNER JOIN "linea_detalle" linea_detalle ON orden_compra."id" = linea_detalle."ordenCompraId"
    INNER JOIN cliente cliente ON orden_compra."clienteId" = cliente."id"
    INNER JOIN empresa ON cliente."empresaId" = empresa."id"

WHERE
empresa."id" = ${this.empresa.id}    
GROUP BY
    cliente."nombre",
    orden_compra."numero",
    orden_compra."id",
    orden_compra."emision",
    orden_compra."entrega"
ORDER BY
    orden_compra."emision" ASC
  `;

    const queryRunner = dataSource.createQueryRunner();
    const rows: Array<IOrdenConsolidada> = await queryRunner.manager.query(sql);
    queryRunner.release();

    return rows;
  }
}
