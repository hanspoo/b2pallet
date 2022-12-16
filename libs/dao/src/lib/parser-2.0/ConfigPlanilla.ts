import { ConfigCampo } from './ConfigCampo';
import { Campo } from './Campo';

export class ConfigPLanilla {
  addCampo(campo: Campo, columna: number) {
    this.campos.push(new ConfigCampo(campo, columna));
  }
  campos: Array<ConfigCampo> = [];
  constructor(public nombre: string) {}
}
