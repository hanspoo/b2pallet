import { DataSource } from 'typeorm';
import { User } from './entity/user.entity';
import { Local } from './entity/local.entity';
import { Cliente } from './entity/cliente.entity';
import { UnidadNegocio } from './entity/unidad-negocio.entity';
import { OrdenCompra } from './entity/orden-compra.entity';
import { LineaDetalle } from './entity/linea-detalle.entity';
import { Producto } from './entity/producto.entity';
import { Pedido } from './entity/pedido.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  username: 'test',
  password: 'test',

  database: 'test',
  entities: [
    User,
    Local,
    Cliente,
    UnidadNegocio,
    OrdenCompra,
    LineaDetalle,
    Producto,
    Pedido,
  ],
  logging: true,
  synchronize: true,
});

export { dataSource };
