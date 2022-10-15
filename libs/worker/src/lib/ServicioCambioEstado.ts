import { EstadoLinea } from '@flash-ws/api-interfaces';
import { dataSource, LineaDetalle, OrdenCompra } from '@flash-ws/dao';
import { OrdenService } from './OrdenService';

export class ServicioCambioEstado {
  orden: OrdenCompra;
  async loadOrden(id: number) {
    this.orden = await OrdenService.loadConLineas(id);
    if (!this.orden) throw Error(`Orden ${id} no encontrada`);
  }
  async cambiar(ids: number[], estado: EstadoLinea) {
    if (!ids) throw Error('No vienen los ids');
    if (!estado) throw Error('No viene el estado');
    const repo = dataSource.getRepository(LineaDetalle);

    // const lineas = this.orden.lineas.filter((linea) => ids.includes(linea.id));
    const promesas = this.orden.lineas.map((linea) => {
      if (ids.includes(linea.id)) {
        if (linea.estado !== estado) {
          linea.estado = estado;
          return repo.save(linea);
        }
      }
      return null;
    });

    await Promise.all(promesas.filter((p) => p));

    return this.orden;
  }
}
