import * as express from 'express';
import { Request, Response } from 'express';
import { dataSource as myDataSource, Producto } from '@flash-ws/dao';

const productos = express.Router();
productos.get('/', async function (req: Request, res: Response) {
  const productos = await myDataSource.getRepository(Producto).find();
  res.json(productos);
});

productos.get('/:id', async function (req: Request, res: Response) {
  const results = await myDataSource.getRepository(Producto).findOneBy({
    id: req.params.id as unknown as number,
  });
  return res.send(results);
});

productos.post('/', async function (req: Request, res: Response) {
  const user = await myDataSource.getRepository(Producto).create(req.body);
  const results = await myDataSource.getRepository(Producto).save(user);
  return res.send(results);
});

productos.put('/:id', async function (req: Request, res: Response) {
  const user = await myDataSource.getRepository(Producto).findOneBy({
    id: req.params.id as unknown as number,
  });
  myDataSource.getRepository(Producto).merge(user, req.body);
  const results = await myDataSource.getRepository(Producto).save(user);
  return res.send(results);
});

productos.delete('/:id', async function (req: Request, res: Response) {
  const results = await myDataSource
    .getRepository(Producto)
    .delete(req.params.id);
  return res.send(results);
});

export { productos };
