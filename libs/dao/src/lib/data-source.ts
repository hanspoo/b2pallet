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
import { Pallet } from './entity/pallet.entity';
import { ProtoPallet } from './entity/proto-pallet.entity';
import { Caja } from './entity/caja.entity';
import { Archivo } from './entity/archivo.entity';

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
    Archivo,
    User,
    Local,
    Cliente,
    UnidadNegocio,
    OrdenCompra,
    Pallet,
    LineaDetalle,
    Producto,
    Pedido,
    Box,
    Caja,
    ProtoPallet,
  ],
  logging: false,
  synchronize: true,

  extra: { max: 10, connectionTimeoutMillis: 2000 },
});

export { dataSource };
