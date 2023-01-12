import { EstadoLinea } from '@flash-ws/api-interfaces';
import { In } from 'typeorm';
import { dataSource, LineaDetalle, OrdenCompra } from '@flash-ws/dao';

export class ServicioCambioEstado {
  orden: OrdenCompra;
  async loadOrden(id: string) {
    this.orden = await dataSource
      .getRepository(OrdenCompra)
      .findOne({ where: { id }, relations: ['lineas'] });
    if (!this.orden) throw Error(`Orden ${id} no encontrada`);
  }
  async cambiar(ids: number[], estado: EstadoLinea) {
    if (!ids) throw Error('No vienen los ids');
    if (!estado) throw Error('No viene el estado');
    const repo = dataSource.getRepository(LineaDetalle);
    await repo.update(
      { ordenCompraId: this.orden.id, id: In(ids) },
      { estado }
    );

    // // const lineas = this.orden.lineas.filter((linea) => ids.includes(linea.id));
    this.orden.lineas.map((linea) => {
      if (ids.includes(linea.id)) {
        if (linea.estado !== estado) {
          linea.estado = estado;
        }
      }
      return null;
    });

    return this.orden;
  }
}
