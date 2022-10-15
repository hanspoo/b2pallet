import { dataSource } from './data-source';
import { Cliente } from './entity/cliente.entity';
import { UnidadNegocio } from './entity/unidad-negocio.entity';
import { Producto } from './entity/producto.entity';
import { Box } from './entity/box.entity';

export async function inicializarCencosud(): Promise<Cliente> {
  if (!dataSource.isInitialized) await dataSource.initialize();
  // const entities = dataSource.entityMetadatas;

  // for (const entity of entities) {
  //   const repository = dataSource.getRepository(entity.name); // Get repository
  //   await repository.clear(); // Clear each entity table's content
  // }

  const repoProducto = dataSource.getRepository(Producto);
  const repoCliente = dataSource.getRepository(Cliente);
  const c = new Cliente();
  c.unidades = [crearUnidad(c, 'Jumbo'), crearUnidad(c, 'Sisa')];
  c.nombre = 'Cencosud';

  const p = new Producto();
  p.box = new Box();
  p.box.largo = 1;
  p.box.ancho = 1;
  p.box.alto = 1;
  p.codCenco = '1647753';
  p.nombre = 'Producto de prueba';
  p.peso = 1;
  p.vigente = true;
  p.codigo = '1234567';

  await repoProducto.save(p);

  return await repoCliente.save(c);
}

function crearUnidad(c: Cliente, nombre: string) {
  const u = new UnidadNegocio();
  u.nombre = nombre;
  u.cliente = c;
  u.locales = [];
  u.ordenes = [];
  return u;
}
