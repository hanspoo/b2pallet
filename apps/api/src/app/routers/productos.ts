import * as express from 'express';
import { Request, Response } from 'express';
import multer = require('multer');
import { dataSource, Empresa, Producto } from '@flash-ws/core';
import { ProductoService } from '@flash-ws/core';

const productos = express.Router();
productos.get('/', async function (req: Request, res: Response) {
  const empresa: Empresa = req['empresa'];

  const productos = await dataSource
    .getRepository(Producto)
    .find({ where: { empresa: { id: empresa.id } }, relations: ['box'] });
  res.json(productos);
});

productos.get('/:id', async function (req: Request, res: Response) {
  const results = await dataSource.getRepository(Producto).findOneBy({
    id: req.params.id as unknown as number,
  });
  return res.send(results);
});

productos.post('/', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(Producto).create(req.body);
  const results = await dataSource.getRepository(Producto).save(user);
  return res.send(results);
});

const upload = multer({ dest: 'uploads/' });

productos.post(
  '/masivo',
  upload.single('file'),
  async function (req: any, res) {
    const service = new ProductoService(req['empresa']);
    try {
      const status = await service.cargarPlanilla(req.file.path);
      res.send(status);
    } catch (error) {
      res.status(400).send({ msg: JSON.stringify(error) });
    }
  }
);

productos.put('/:id', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(Producto).findOneBy({
    id: req.params.id as unknown as number,
  });
  dataSource.getRepository(Producto).merge(user, req.body);
  const results = await dataSource.getRepository(Producto).save(user);
  return res.send(results);
});

productos.delete('/:id', async function (req: Request, res: Response) {
  const results = await dataSource
    .getRepository(Producto)
    .delete(req.params.id);
  return res.send(results);
});

export { productos };
