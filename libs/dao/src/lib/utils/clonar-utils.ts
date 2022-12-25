import { ProtoPallet } from '../..';

export function clonarProtos(
  muestra: Array<Partial<ProtoPallet>>
): Array<Partial<ProtoPallet>> {
  return muestra.map((pallet) => limpiarPallet(pallet));
}
function limpiarPallet(pallet: Partial<ProtoPallet>): any {
  pallet.id = undefined;
  const { box } = pallet;
  if (box) box.id = undefined;
  return pallet;
}
