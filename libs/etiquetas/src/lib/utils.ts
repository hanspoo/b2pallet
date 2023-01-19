import { PDFDocument, PDFPage } from 'pdf-lib';

export async function mergePdfs1(pdfsToMerges: ArrayBuffer[]) {
  const mergedPdf = await PDFDocument.create();
  const actions = pdfsToMerges.map(async (pdfBuffer) => {
    const pdf = await PDFDocument.load(pdfBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page: any) => {
      // console.log('page', page.getWidth(), page.getHeight());
      // page.setWidth(210);
      mergedPdf.addPage(page);
    });
  });
  await Promise.all(actions);
  const mergedPdfFile = await mergedPdf.save();
  return mergedPdfFile;
}

export async function mergePdfs2(
  pdfsToMerge: ArrayBuffer[]
): Promise<ArrayBufferLike> {
  const mergedPdf: PDFDocument = await PDFDocument.create();

  const createInnerPromise = async (
    arrayBuffer: ArrayBuffer
  ): Promise<PDFPage[]> => {
    const pdf: PDFDocument = await PDFDocument.load(arrayBuffer);
    return await mergedPdf.copyPages(pdf, pdf.getPageIndices());
  };

  const outerPromise: Promise<PDFPage[]>[] = pdfsToMerge.map((arrayBuffer) => {
    const innerPromise: Promise<PDFPage[]> = createInnerPromise(arrayBuffer);
    return innerPromise;
  });

  const resultOuterPromise: PDFPage[][] = await Promise.all(outerPromise);

  resultOuterPromise.forEach((pageArray: PDFPage[]) => {
    pageArray.forEach((page: PDFPage) => {
      mergedPdf.addPage(page);
    });
  });

  return (await mergedPdf.save()).buffer;
}

async function mergePDFDocuments(documents: any) {
  const mergedPdf = await PDFDocument.create();

  for (let document of documents) {
    document = await PDFDocument.load(document);

    const copiedPages = await mergedPdf.copyPages(
      document,
      document.getPageIndices()
    );
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}
