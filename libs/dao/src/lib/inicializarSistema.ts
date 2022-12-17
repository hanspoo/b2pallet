import { dataSource } from './data-source';
import { Empresa } from './entity/auth/empresa.entity';
import { Usuario } from './entity/auth/usuario.entity';
import { Box } from './entity/box.entity';
import { ProtoPallet } from './entity/proto-pallet.entity';

export async function inicializarSistema(): Promise<Empresa> {
  if (!dataSource.isInitialized) await dataSource.initialize();
  const repoEmpresa = dataSource.getRepository(Empresa);
  const e = await repoEmpresa.findOne({ where: { nombre: 'b2pallet' } });
  if (e) {
    console.log(`Inicialización cancelada, empresa b2pallet ya existe`);
    return e;
  }

  const empresa = await crearEmpresa();
  const protoPallet = await crearProtoPallet();
  empresa.protoPallets = [protoPallet];

  return repoEmpresa.save(empresa);
}
export async function crearProtoPallet() {
  const p = new ProtoPallet();
  p.box = Box.from({ largo: 100, ancho: 120, alto: 170 });
  p.nombre = 'Standard Pallet';

  return p;
}

export async function crearEmpresa(): Promise<Empresa> {
  const repoEmpresa = dataSource.getRepository(Empresa);
  const e = repoEmpresa.create({
    nombre: 'b2pallet',
    identLegal: '76531540-9',
  });

  const user = dataSource.getRepository(Usuario).create({
    email: 'admin@b2pallet.com',
    password: '123456',
    nombre: 'Admin',
  });

  e.usuarios = [user];

  return e;
}
