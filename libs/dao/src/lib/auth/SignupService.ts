import { dataSource } from '../data-source';
import { Empresa } from '../entity/auth/empresa.entity';
import { Usuario } from '../entity/auth/usuario.entity';

export type SignupArgs = {
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

  async execute(): Promise<Empresa> {
    const repoEmpresa = dataSource.getRepository(Empresa);
    const e = await repoEmpresa.save(
      repoEmpresa.create({
        nombre: this.empresa,
      })
    );

    const user = dataSource.getRepository(Usuario).create({
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      esAdmin: true,
    });

    e.usuarios = [user];

    return await repoEmpresa.save(e);
  }

  async validate(): Promise<[boolean, Array<string>]> {
    const errors: Array<string> = [];
    if (!/\w+/.test(this.empresa)) errors.push('Empresa inválida');
    if (!/\w+/.test(this.nombre)) errors.push('Nombre inválido');
    if (!/\w+/.test(this.email)) errors.push('Email inválido');
    if (!/\w+/.test(this.password)) errors.push('Contraseña inválida');
    if (errors.length > 0) return [false, errors];

    return [true, []];
  }
  constructor(params: SignupArgs) {
    this.empresa = params.empresa;
    this.nombre = params.nombre;
    this.email = params.email;
    this.password = params.password;
  }
}
