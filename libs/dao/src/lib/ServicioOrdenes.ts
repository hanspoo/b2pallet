import { IOrdenConsolidada } from '@flash-ws/api-interfaces';
import { dataSource } from './data-source';

export class ServicioOrdenes {
  static async ordenes(): Promise<IOrdenConsolidada[]> {
    const sql = `
    SELECT
    sum(linea_detalle."cantidad") AS cajas,
    unidad_negocio."nombre" AS unidad,
    cliente."nombre" AS cliente,
    orden_compra."numero" AS numero,
    orden_compra."id" AS id,
    orden_compra."emision" as emision,
    orden_compra."entrega" as entrega
FROM
    "orden_compra" orden_compra INNER JOIN "linea_detalle" linea_detalle ON orden_compra."id" = linea_detalle."ordenCompraId"
    INNER JOIN "unidad_negocio" unidad_negocio ON orden_compra."unidadId" = unidad_negocio."id"
    INNER JOIN "cliente" cliente ON unidad_negocio."clienteId" = cliente."id"
GROUP BY
    unidad_negocio."nombre",
    cliente."nombre",
    orden_compra."numero",
    orden_compra."id",
    orden_compra."emision",
    orden_compra."entrega"
    
order by 
orden_compra."emision"     
  `;

    const queryRunner = dataSource.createQueryRunner();
    const rows: Array<IOrdenConsolidada> = await queryRunner.manager.query(sql);
    queryRunner.release();

    return rows;
  }
}
