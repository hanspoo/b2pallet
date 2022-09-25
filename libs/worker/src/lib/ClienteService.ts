import { Cliente, Local, Pedido, dataSource } from '@flash-ws/dao';

const repo = dataSource.getRepository(Cliente);

export class ClienteService {
  static async findByUnidades(id: number): Promise<Cliente> {
    const clientes = await repo.find({
      where: { id },
      relations: { unidades: true },
    });

    if (clientes.length === 0) throw Error(`Cliente ${id} no encontrado`);

    const cliente = clientes[0];

    console.log(`Cliente ${id}`, JSON.stringify(cliente));

    return cliente;
  }
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
