import * as express from 'express';
import { Request, Response } from 'express';
import multer = require('multer');
import { dataSource, OrdenCompra } from '@flash-ws/dao';
import { OrdenService } from '@flash-ws/worker';

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

export { files };
