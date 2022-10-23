/** Este servicio recibe una orden de compra y deja todas las líneas que correspondan al producto indicador, en el estado solicitado
 *
 */
import { EstadoLinea } from '@flash-ws/api-interfaces';
import {
  inicializarCencosud,
  LineaDetalle,
  Local,
  OrdenCompra,
  Producto,
  UnidadNegocio,
} from '@flash-ws/dao';
import { ClienteService } from '../lib/ClienteService';
import { ServicioCambioEstadoProdConsolidada } from '../lib/ServicioCambioEstadoProdConsolidada';

let sisa: UnidadNegocio;

beforeAll(async () => {
  await inicializarCencosud();
  const cliente = await ClienteService.findById(1);
  sisa = cliente.unidades.find((u) => u.nombre === 'Sisa');
});

describe('cambio estado en consolidada', () => {
  it('una línea mismo producto solicitado cambia estado', () => {
    const producto = new ProductoBuilder().conID(1).build();
    const orden = new OrdenBuiler()
      .conLinea(
        new LineaBuilder()
          .conEstado(EstadoLinea.Nada)
          .conProducto(producto)
          .build()
      )
      .build();
    const servicio = new ServicioCambioEstadoProdConsolidada(
      orden,
      producto,
      EstadoLinea.Aprobada
    );
    servicio.ejecutar();
    expect(orden.lineas[0].estado).toBe(EstadoLinea.Aprobada);
  });
  it('dos líneas, dos productos, solo cambia la de producto 1', () => {
    const p1 = new ProductoBuilder().conID(1).build();
    const p2 = new ProductoBuilder().conID(2).build();
    const orden = new OrdenBuiler()
      .conLinea(
        new LineaBuilder().conEstado(EstadoLinea.Nada).conProducto(p1).build()
      )
      .conLinea(
        new LineaBuilder().conEstado(EstadoLinea.Nada).conProducto(p2).build()
      )
      .build();
    const servicio = new ServicioCambioEstadoProdConsolidada(
      orden,
      p1,
      EstadoLinea.Aprobada
    );
    servicio.ejecutar();
    expect(orden.lineas.find((linea) => linea.producto === p1).estado).toBe(
      EstadoLinea.Aprobada
    );
    expect(orden.lineas.find((linea) => linea.producto === p2).estado).toBe(
      EstadoLinea.Nada
    );
  });
});

class OrdenBuiler {
  orden: OrdenCompra = {
    id: 17,
    numero: '5575426472',
    emision: '15-09-2022',
    entrega: '22-09-2022',
    unidad: sisa,
    lineas: [],
  };

  lineas: Array<LineaDetalle> = [];

  build(): OrdenCompra {
    return this.orden;
  }
  conLinea(linea: LineaDetalle) {
    this.orden.lineas.push(linea);
    return this;
  }
}

class LineaBuilder {
  linea: any = {
    cantidad: 1,
    estado: EstadoLinea.Nada,
  };

  conEstado(estado: EstadoLinea) {
    this.linea.estado = estado;
    return this;
  }

  conProducto(producto: Producto): any {
    this.linea.producto = producto;
    return this;
  }
  conLocal(local: Local): any {
    this.linea.local = local;
    return this;
  }

  build(): LineaDetalle {
    return this.linea;
  }
}
class ProductoBuilder {
  producto: any = {
    nombre: 'Bandeja Diseño Ely Chica',
    codigo: 'CT-01005430',
    peso: 1950,
    codCenco: '1651844',
    vigente: true,
  };

  conID(id: number) {
    this.producto.id = id;
    return this;
  }

  build(): Producto {
    return this.producto;
  }
}
