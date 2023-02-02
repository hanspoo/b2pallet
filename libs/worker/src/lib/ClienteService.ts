import { Cliente, Local, Pedido, dataSource } from '@flash-ws/core';

const repo = dataSource.getRepository(Cliente);

export class ClienteService {
  static async findById(id: number): Promise<Cliente> {
    if (!id) throw Error('No viene el id del cliente');
    const clientes = await repo.find({
      where: { id },
      relations: { unidades: true },
    });

    if (clientes.length === 0) throw Error(`Cliente ${id} no encontrado`);

    const cliente = clientes[0];


    return cliente;
  }
  async findLocal(id: any): Promise<Local> {
    const locales = await this.findLocales();
    return locales.find((local) => local.id === id);
  }
  async findLocales(): Promise<Array<Local>> {
    return await dataSource
      .getRepository(Local)
      .createQueryBuilder('local')
      .leftJoinAndSelect('local.unidad', 'unidad')
      .leftJoinAndSelect('unidad.cliente', 'cliente')
      .getMany();
  }
  crearPedido() {
    const pedido = new Pedido();
    pedido.cliente = this.cliente;
    return pedido;
  }

  constructor(public cliente: Cliente) {}
}
