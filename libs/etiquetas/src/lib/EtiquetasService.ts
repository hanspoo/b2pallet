import { jsPDF } from "jspdf";

import { EtiquetaCaja } from "./EtiquetaProducto";
import { dataSource, OrdenCompra } from "@flash-ws/dao";
import { randomBytes } from "crypto";
import { PDFDocument } from "pdf-lib";
import { epBarcode } from "./epBarcode";
import { epcajaBarcode } from "./epcajaBarcode";
import { numericPart } from "@flash-ws/shared";
import { EtiquetaPallet } from "@flash-ws/api-interfaces";

export class EtiquetasService {
  async etiquetasProductos(idPallet: number): Promise<EtiquetaCaja[]> {
    const sql = `
    SELECT
     caja."palletId" AS caja_palletId,
     producto."nombre" AS producto,
     producto."codCenco" AS "codCenco"
FROM
     "local" local INNER JOIN "pallet" pallet ON local."id" = pallet."localId"
     INNER JOIN "orden_compra" orden_compra ON pallet."ordenCompraId" = orden_compra."id"
     INNER JOIN "caja" caja ON pallet."id" = caja."palletId"
     INNER JOIN "linea_detalle" linea_detalle ON caja."lineaId" = linea_detalle."id"
     INNER JOIN "producto" producto ON linea_detalle."productoId" = producto."id"
     INNER JOIN "cliente" cliente ON orden_compra."clienteId" = cliente."id"
     INNER JOIN "empresa" empresa ON cliente."empresaId" = empresa."id"
WHERE
     orden_compra."id" = '${this.orden.id}' and caja."palletId" = ${idPallet} order by caja.id`;

    const queryRunner = dataSource.createQueryRunner();
    const rows: Array<EtiquetaCaja> = await queryRunner.manager.query(sql);
    const rowsConPosicion = rows.map((row, i) => ({
      ...row,
      posicion: `${i + 1} de ${rows.length}`,
    }));

    queryRunner.release();

    return rowsConPosicion;
  }
  async genPdfProductos(cajas: EtiquetaCaja[]): Promise<string> {
    {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        // format: [40, 50],
        format: "a9",
      });
      doc.setFontSize(8);

      const barcodes = await Promise.all(
        cajas.map((ep) => {
          return epcajaBarcode({ ep });
        })
      );
      cajas.forEach((ep, i) => {
        if (i > 0) doc.addPage();

        const width = doc.internal.pageSize.getWidth();
        // const height = doc.internal.pageSize.getHeight();

        doc.addImage(
          `data:image/png;base64,${barcodes[i].toString("base64")}`,
          "png",
          1,
          1,
          width,
          15
        );

        if (!ep.codCenco) {
          console.log("ep", ep);
          throw Error("No viene codcenco");
        }

        centeredNormal(doc, ep.codCenco, 20, 10);
        centeredNormal(doc, ep.producto, 28, 8);
        centeredNormal(doc, ep.posicion, 32, 8);
      });

      const fileName = `/tmp/` + randomBytes(6).toString("hex") + ".pdf";
      doc.save(fileName);

      return fileName;
    }
  }
  async genPdf(etiPallets: EtiquetaPallet[]): Promise<string> {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "cm",
      format: "a7",
      compress: true,
    });
    doc.setFontSize(14);

    const barcodes = await Promise.all(
      etiPallets.map((ep) => {
        return epBarcode({ ep });
      })
    );
    etiPallets.forEach((ep, i) => {
      if (i > 0) doc.addPage();

      if (!ep["identLegal"])
        throw Error(`No viene identlegal en etipallet` + JSON.stringify(ep));

      // doc.text(ep.identLegal, 1, 1);
      // doc.text(ep.codLocal, 1, 2);
      // doc.text(ep.hu + '', 1, 3);
      // doc.text(ep.vendedor, 1, 4);

      // fs.writeFileSync('/tmp/xxx.png', barcodes[i]);

      const width = doc.internal.pageSize.getWidth();
      doc.addImage(
        `data:image/png;base64,${barcodes[i].toString("base64")}`,
        "png",
        0.5,
        0.5,
        width - 1,
        2,
        "FAST"
      );

      centeredNormal(
        doc,
        numericPart(ep.identLegal) + ep.hu.toString().padStart(8, "0"),
        3
      );
      centeredBold(doc, ep.vendedor, 4.4);
      centeredNormal(doc, ep.local, 5.5);
      centeredBold(doc, ep.codLocal, 6.3);
    });

    const fileName = `/tmp/` + randomBytes(6).toString("hex") + ".pdf";
    doc.save(fileName);

    return fileName;
  }

  async etiquetasPallets(palletID?: number): Promise<EtiquetaPallet[]> {
    let sql = `
SELECT
     empresa."identLegal" AS "identLegal",
     empresa."nombre" AS "vendedor",
     local."nombre" AS "local",
     local."codigo" AS "codLocal",
     pallet."hu" AS "hu"
FROM
     "local" local INNER JOIN "pallet" pallet ON local."id" = pallet."localId"
     INNER JOIN "orden_compra" orden_compra ON pallet."ordenCompraId" = orden_compra."id"
     INNER JOIN "cliente" cliente ON orden_compra."clienteId" = cliente."id"
     INNER JOIN "empresa" empresa ON cliente."empresaId" = empresa."id"
WHERE
    orden_compra."id" = '${this.orden.id}'
     `;
    if (palletID) sql += `AND pallet.id = ${palletID}`;
    const queryRunner = dataSource.createQueryRunner();
    const rows: Array<EtiquetaPallet> = await queryRunner.manager.query(sql);

    queryRunner.release();

    return rows;
  }
  constructor(public orden: OrdenCompra) {}
}

async function mergePDFDocuments(pdfsToMerges: ArrayBuffer[]) {
  const mergedPdf = await PDFDocument.create();
  const actions = pdfsToMerges.map(async (pdfBuffer) => {
    const pdf = await PDFDocument.load(pdfBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => {
      // console.log('page', page.getWidth(), page.getHeight());
      // page.setWidth(210);
      mergedPdf.addPage(page);
    });
  });
  await Promise.all(actions);
  const mergedPdfFile = await mergedPdf.save();
  return mergedPdfFile;
}

const centeredBold = function (doc: any, text: string, y: number) {
  doc.setFontSize(18);
  const textWidth =
    (doc.getStringUnitWidth(text) * doc.internal.getFontSize()) /
    doc.internal.scaleFactor;
  const textOffset = (doc.internal.pageSize.width - textWidth) / 2;
  doc.setFont(undefined, "bold");
  doc.text(textOffset, y, text);
  doc.setFontSize(14).setFont(undefined, "normal");
};
const centeredNormal = function (doc: any, text: string, y: number, size = 14) {
  doc.setFontSize(size);
  const textWidth =
    (doc.getStringUnitWidth(text) * doc.internal.getFontSize()) /
    doc.internal.scaleFactor;
  const textOffset = (doc.internal.pageSize.width - textWidth) / 2;
  // doc.setFontSize(18).setFont(undefined, 'bold');
  doc.text(textOffset, y, text);
  // doc.setFontSize(14).setFont(undefined, 'normal');
};
