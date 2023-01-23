import { EtiquetaPallet } from "@flash-ws/api-interfaces";
import { numericPart } from "@flash-ws/shared";
import bwipjs from "bwip-js";

export function epBarcode({ ep }: { ep: EtiquetaPallet }): Promise<Buffer> {
  return bwipjs.toBuffer({
    bcid: "code128",
    text: `${numericPart(ep.identLegal)}${ep.hu.toString().padStart(8, "0")}`,
    // scaleX: 10,
    // height: 1,
    // width: 60,
    includetext: false,
    textsize: 12,

    textxalign: "center", // Always good to set this
  });
}
