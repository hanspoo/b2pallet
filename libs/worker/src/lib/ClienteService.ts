import { Cliente, Local, Pedido } from '@flash-ws/dao';

export class ClienteService {
  findLocal(codLocal: any): Local {
    const locales: Array<Local> = this.cliente.unidades.reduce((acc, iter) => {
      acc = [...acc, ...iter.locales];
      return acc;
    }, []);

    return locales.find((local) => local.id === codLocal);
  }
  findLocales(): Array<Local> {
    const locales: Array<Local> = this.cliente.unidades.reduce((acc, iter) => {
      acc = [...acc, ...iter.locales];
      return acc;
    }, []);

    return locales;
  }
  crearPedido() {
    const pedido = new Pedido();
    pedido.cliente = this.cliente;
    return pedido;
  }
  constructor(public cliente: Cliente) {}
}
