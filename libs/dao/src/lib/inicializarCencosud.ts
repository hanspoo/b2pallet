import { dataSource } from './data-source';
import { Cliente } from './entity/cliente.entity';
import { UnidadNegocio } from './entity/unidad-negocio.entity';
import { Producto } from './entity/producto.entity';
import { Box } from './entity/box.entity';
import { Empresa } from './entity/auth/empresa.entity';
import e from 'express';
import { Usuario } from './entity/auth/usuario.entity';
import { LoginService } from './auth/LoginService';
import { ProtoPallet } from './entity/proto-pallet.entity';

export const obtainToken = async () => {
  const [isOk, token] = await new LoginService().login(
    'info@welinux.cl',
    '123456'
  );
  if (!isOk) throw Error('Error de fake login en test no ok');
  if (!token) throw Error('Error de fake login en test token invalido');
  return token;
};

export const CODIGO_PROD = 'KP-TOOTH -1.6*65MM';
export async function inicializarCencosud(): Promise<Cliente> {
  if (!dataSource.isInitialized) await dataSource.initialize();
  // const entities = dataSource.entityMetadatas;

  // for (const entity of entities) {
  //   const repository = dataSource.getRepository(entity.name); // Get repository
  //   await repository.clear(); // Clear each entity table's content
  // }

  const repoProducto = dataSource.getRepository(Producto);
  const repoCliente = dataSource.getRepository(Cliente);
  const cliente = new Cliente();
  cliente.unidades = [
    crearUnidad(cliente, 'Jumbo'),
    crearUnidad(cliente, 'Sisa'),
  ];
  cliente.nombre = 'Cencosud';
  cliente.identLegal = '13297015-7';

  const producto = new Producto();
  producto.box = new Box();
  producto.box.largo = 1;
  producto.box.ancho = 1;
  producto.box.alto = 1;
  producto.codCenco = '1647753';
  producto.nombre = 'Producto de prueba';
  producto.peso = 1;
  producto.vigente = true;
  producto.codigo = CODIGO_PROD;

  // await repoProducto.save(p);

  const repoEmpresa = dataSource.getRepository(Empresa);
  const repoProto = dataSource.getRepository(ProtoPallet);
  const e = await repoEmpresa.save(
    repoEmpresa.create({
      nombre: 'b2pallet',
      identLegal: '123456789',
    })
  );

  const user = dataSource.getRepository(Usuario).create({
    email: 'info@welinux.cl',
    password: '123456',
    nombre: 'Usuario de prueba',
  });

  e.clientes = [cliente];
  e.productos = [producto];
  e.usuarios = [user];

  const proto = {
    id: 3,
    nombre: 'Standard Pallet',
    box: {
      largo: 100.0,
      ancho: 120.0,
      alto: 170.0,
    },
  };

  e.protoPallets = [repoProto.create(proto)];

  await repoEmpresa.save(e);

  return cliente;
}

function crearUnidad(c: Cliente, nombre: string) {
  const u = new UnidadNegocio();
  u.nombre = nombre;
  u.cliente = c;
  u.locales = [];
  u.ordenes = [];
  return u;
}
