import { Campo } from './Campo';
import { ConfigPLanilla } from './ConfigPlanilla';

const configCenco = new ConfigPLanilla('Gargola S.A.');

configCenco.addCampo(Campo.IDENT_LEGAL, 3);
configCenco.addCampo(Campo.NOMBRE_CLIENTE, 4);
configCenco.addCampo(Campo.UNIDAD_NEGOCIO, 37);

configCenco.addCampo(Campo.COD_LOCAL, 13);
configCenco.addCampo(Campo.NOMBRE_LOCAL, 14);

configCenco.addCampo(Campo.COD_CENCOSUD, 16);
configCenco.addCampo(Campo.COD_PROVEEDOR, 17);
configCenco.addCampo(Campo.CANTIDAD, 23);

configCenco.addCampo(Campo.NUM_ORDEN, 1);
configCenco.addCampo(Campo.FEC_EMISION, 7);
configCenco.addCampo(Campo.FEC_ENTREGA, 8);

export { configCenco };
