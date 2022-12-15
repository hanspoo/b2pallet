import { Campo } from '../../../lib/parser-2.0/Campo';
import { ConfigPLanilla } from '../../../lib/parser-2.0/ConfigPLanilla';

export const config = new ConfigPLanilla('Gargola S.A.');

config.addCampo(Campo.IDENT_LEGAL, 3);
config.addCampo(Campo.NOMBRE_CLIENTE, 4);
config.addCampo(Campo.UNIDAD_NEGOCIO, 37);

config.addCampo(Campo.COD_LOCAL, 13);
config.addCampo(Campo.NOMBRE_LOCAL, 14);

config.addCampo(Campo.COD_CENCOSUD, 16);
config.addCampo(Campo.COD_PROVEEDOR, 17);
config.addCampo(Campo.CANTIDAD, 23);

config.addCampo(Campo.NUM_ORDEN, 1);
config.addCampo(Campo.FEC_EMISION, 7);
config.addCampo(Campo.FEC_ENTREGA, 8);
