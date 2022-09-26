import * as crypto from 'node:crypto';
import { DataSource } from 'typeorm';
import { User } from './entity/user.entity';
import { Local } from './entity/local.entity';
import { Cliente } from './entity/cliente.entity';
import { UnidadNegocio } from './entity/unidad-negocio.entity';
import { OrdenCompra } from './entity/orden-compra.entity';
import { LineaDetalle } from './entity/linea-detalle.entity';
import { Producto } from './entity/producto.entity';
import { Pedido } from './entity/pedido.entity';
import { Box } from './entity/box.entity';

const testEnv = 'test';

const dataSource = new DataSource({
  type: process.env['NODE_ENV'] === testEnv ? 'sqlite' : 'postgres',
  host: 'localhost',
  username: 'flash',
  password: 'flash',

  database:
    process.env['NODE_ENV'] === testEnv
      ? '/tmp/db/' + crypto.randomBytes(12).toString('hex')
      : 'flash',
  entities: [
    User,
    Local,
    Cliente,
    UnidadNegocio,
    OrdenCompra,
    LineaDetalle,
    Producto,
    Pedido,
    Box,
  ],
  logging: true,
  synchronize: true,
});

export { dataSource };
