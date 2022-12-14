import { dataSource } from '../data-source';
import { Empresa } from '../entity/auth/empresa.entity';
import { Usuario } from '../entity/auth/usuario.entity';
import { FieldsMapper } from '../entity/campos/FieldsMapper';
import { ProtoPallet } from '../entity/proto-pallet.entity';
import { clonarMappers, clonarProtos } from '../utils/clonar-utils';
import { PassService } from './PassService';

export type SignupArgs = {
  identLegal: string;
  empresa: string;
  nombre: string;
  email: string;
  password: string;
};

export class SignupService {
  empresa: string;
  nombre: string;
  email: string;
  password: string;
  identLegal: string;

  async execute(): Promise<Empresa> {
    const repoEmpresa = dataSource.getRepository(Empresa);
    const repoProto = dataSource.getRepository(ProtoPallet);
    const repoFieldsMapper = dataSource.getRepository(FieldsMapper);

    const protoPallets = await repoProto.find({
      where: { empresa: { id: 1 } },
      relations: ['box'],
    });

    if (!protoPallets) throw Error('Error al recupera los proto pallets');
    if (protoPallets.length === 0)
      throw Error('Error, no hay proto pallets en empresa 1');

    const fieldsMappers = await repoFieldsMapper.find({
      where: { empresa: { id: 1 } },
      relations: ['campos'],
    });

    if (!fieldsMappers) throw Error('Error al recupera los field mappers');
    if (fieldsMappers.length === 0)
      throw Error('Error, no hay field mappers en empresa 1');

    const e = await repoEmpresa.save(
      repoEmpresa.create({
        identLegal: this.identLegal,
        nombre: this.empresa,
        protoPallets: clonarProtos(protoPallets),
        fieldMappers: clonarMappers(fieldsMappers),
      })
    );

    const user = dataSource.getRepository(Usuario).create({
      nombre: this.nombre,
      email: this.email,
      password: await new PassService().hash(this.password),
      esAdmin: true,
    });

    e.usuarios = [user];

    return await repoEmpresa.save(e);
  }

  async validate(): Promise<[boolean, Array<string>]> {
    const errors: Array<string> = [];
    if (!/\w+/.test(this.empresa)) errors.push('Empresa inv??lida');
    if (!/\w+/.test(this.identLegal)) errors.push('Ident legal inv??lido');
    if (!/\w+/.test(this.nombre)) errors.push('Nombre inv??lido');
    if (!/\w+/.test(this.email)) errors.push('Email inv??lido');
    if (!/\w+/.test(this.password)) errors.push('Contrase??a inv??lida');
    if (errors.length > 0) return [false, errors];

    return [true, []];
  }
  constructor(params: SignupArgs) {
    this.empresa = params.empresa;
    this.nombre = params.nombre;
    this.email = params.email;
    this.password = params.password;
    this.identLegal = params.identLegal;
  }
}
