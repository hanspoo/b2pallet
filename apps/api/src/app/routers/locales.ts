import * as express from 'express';
import { Request, Response } from 'express';


import { dataSource, Local } from '@flash-ws/core';

const locales = express.Router();
locales.get('/', async function (req: Request, res: Response) {
  const locales = await dataSource.getRepository(Local).find({});
  res.json(locales);
  
});

locales.get('/:id', async function (req: Request, res: Response) {
  const results = await dataSource.getRepository(Local).findOneBy({
    id: req.params.id as unknown as number,
  });
  return res.send(results);
});

locales.post('/', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(Local).create(req.body);
  const results = await dataSource.getRepository(Local).save(user);
  return res.send(results);
});

locales.put('/:id', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(Local).findOneBy({
    id: req.params.id as unknown as number,
  });
  dataSource.getRepository(Local).merge(user, req.body);
  const results = await dataSource.getRepository(Local).save(user);
  return res.send(results);
});

locales.delete('/:id', async function (req: Request, res: Response) {
  const results = await dataSource.getRepository(Local).delete(req.params.id);
  return res.send(results);
});

export { locales };
