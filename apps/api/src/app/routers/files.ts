import * as fs from 'fs';
import * as express from 'express';
import { Request, Response } from 'express';
import multer = require('multer');
import { dataSource, OrdenCompra } from '@flash-ws/core';
import { OrdenService } from '@flash-ws/worker';
import { EtiquetasService } from '@flash-ws/etiquetas';
import { ParamsEtiquetasProd } from '@flash-ws/api-interfaces';

const files = express.Router();
files.get('/', async function (req: Request, res: Response) {
  const files = await OrdenService.findAll();
  res.json(files);
});

files.get('/:id', async function (req: Request, res: Response) {
  const results = await dataSource.getRepository(OrdenCompra).findOneBy({
    id: req.params.id,
  });
  return res.send(results);
});

files.post('/', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(OrdenCompra).create(req.body);
  const results = await dataSource.getRepository(OrdenCompra).save(user);
  return res.send(results);
});

const upload = multer({ dest: 'uploads/' });

files.post('/upload', upload.single('file'), async function (req: any, res) {
  res.send({ msg: `Procesado archivo ${req.file.path}` });
});

files.put('/:id', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(OrdenCompra).findOneBy({
    id: req.params.id,
  });
  dataSource.getRepository(OrdenCompra).merge(user, req.body);
  const results = await dataSource.getRepository(OrdenCompra).save(user);
  return res.send(results);
});

files.delete('/:id', async function (req: Request, res: Response) {
  const results = await dataSource
    .getRepository(OrdenCompra)
    .delete(req.params.id);
  return res.send(results);
});

files.get(
  '/:id/etiquetas',
  async function (req: Request<Request & { id: string }>, res: Response) {
    const id = req.params.id;
    if (!id) throw Error('No viene el id de orden de compra');
    const orden = await dataSource.getRepository(OrdenCompra).findOne({
      where: { id },
    });
    if (!orden)
      return res.status(404).send({ msg: `orden ${id} no encontrada` });

    const service = new EtiquetasService(orden);
    const etiPallets = await service.etiquetasPallets();
    const path = await service.genPdf(etiPallets);

    const file = fs.createReadStream(path);
    const stat = fs.statSync(path);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename=etiquetas.pdf');
    file.pipe(res);
  }
);

files.get(
  '/:id/etiquetas/:pallet',
  async function (req: Request<Request & ParamsEtiquetasProd>, res: Response) {
    const { id, pallet } = req.params;
    if (!id) throw Error('No viene el id de orden de compra');
    if (!pallet) throw Error('No viene el pallet');

    const orden = await dataSource.getRepository(OrdenCompra).findOne({
      where: { id },
    });
    if (!orden)
      return res.status(404).send({ msg: `orden ${id} no encontrada` });

    const service = new EtiquetasService(orden);
    const datos = await service.etiquetasProductos(pallet);
    const path = await service.genPdfProductos(datos);

    const file = fs.createReadStream(path);
    const stat = fs.statSync(path);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename=etiquetas.pdf');
    file.pipe(res);
  }
);

export { files };
