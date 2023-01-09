import bwipjs from 'bwip-js';
import { EtiquetaPallet } from './EtiquetaPallet';

export function epBarcode({ ep }: { ep: EtiquetaPallet }): Promise<Buffer> {
  return bwipjs.toBuffer({
    bcid: 'code128',
    text: `${ep.identLegal}-${ep.hu}${ep.hu.toString().padStart(8, '0')}`,
    scale: 3,
    height: 10,
    includetext: true,
    textxalign: 'center', // Always good to set this
  });
}
