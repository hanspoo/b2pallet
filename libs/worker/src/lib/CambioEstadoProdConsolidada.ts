import { Consolidado } from './consoli/Consolidado';
import { dataSource, LineaDetalle, OrdenCompra, Producto } from '@flash-ws/dao';
import { EstadoLinea } from '@flash-ws/api-interfaces';

export class CambioEstadoProdConsolidada {
  async ejecutar() {
    const target = this.orden.lineas.filter((linea) =>
      linea.productoId
        ? linea.productoId === this.producto.id
        : linea.producto.id === this.producto.id
    );

    const promesas = target.map((linea) => {
      if (linea.estado !== this.estado) {
        linea.estado = this.estado;
        return dataSource.getRepository(LineaDetalle).save(linea);
      } else {
        return null;
      }
    });
    await Promise.all(promesas.filter((p) => p !== null));
    const conso = new Consolidado(this.orden.lineas);
    await conso.calcular();
    return conso;
  }
  constructor(
    public orden: OrdenCompra,
    public producto: Producto,
    public estado: EstadoLinea
  ) {}
}
