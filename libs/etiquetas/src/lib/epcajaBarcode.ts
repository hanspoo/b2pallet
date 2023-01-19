import bwipjs from 'bwip-js';
import { EtiquetaCaja } from './EtiquetaProducto';

export function epcajaBarcode({ ep }: { ep: EtiquetaCaja }): Promise<Buffer> {
  return bwipjs.toBuffer({
    bcid: 'code128',
    text: `${ep.codCenco}`,
    scale: 1,
    height: 1,
    // width: 60,
    includetext: false,
    textsize: 10,

    textxalign: 'center', // Always good to set this
  });
}
