import { Consolidado } from './consoli/Consolidado';
import { dataSource, LineaDetalle, OrdenCompra, Producto } from '@flash-ws/core';
import { EstadoLinea } from '@flash-ws/api-interfaces';

export class CambioEstadoProdConsolidada {
  constructor(
    public orden: OrdenCompra,
    public productos: Producto[],
    public estado: EstadoLinea
  ) {}
  lineasModificadas: Array<LineaDetalle> = [];

  async salvar() {
    const repo = dataSource.getRepository(LineaDetalle);
    const promesas = this.lineasModificadas.map((linea) => repo.save(linea));
    await Promise.all(promesas);
  }
  async ejecutar() {
    const ids = new Set(this.productos.map((p) => p.id));
    const target = this.orden.lineas.filter((linea) =>
      linea.productoId ? ids.has(linea.productoId) : ids.has(linea.producto.id)
    );

    const promesas = target.map((linea) => {
      if (linea.estado !== this.estado) {
        linea.estado = this.estado;
        this.lineasModificadas.push(linea);
      } else {
        return null;
      }
    });
    await Promise.all(promesas.filter((p) => p !== null));
    const conso = new Consolidado(this.orden.lineas);
    await conso.calcular();
    return conso;
  }
}
