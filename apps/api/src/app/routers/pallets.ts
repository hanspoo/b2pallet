import * as express from 'express';
import { Request, Response } from 'express';

import { cajasPallet, dataSource, Pallet } from '@flash-ws/core';

const pallets = express.Router();
pallets.get('/', async function (req: Request, res: Response) {
  const pallets = await dataSource.getRepository(Pallet).find({});
  res.json(pallets);
});

pallets.get(
  '/:id',
  async function (req: Request<{ id: number }>, res: Response) {
    if (!req.params.id)
      return res.status(400).send('No viene el id de pallet: ' + req.params.id);
    const pallet = await dataSource
      .getRepository(Pallet)
      .findOne({ where: { id: req.params.id } });
    if (!pallet)
      return res.status(404).send(`Pallet ${req.params.id} no encontrado`);
    const results = await cajasPallet(req.params.id);
    return res.send(results);
  }
);

pallets.post('/', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(Pallet).create(req.body);
  const results = await dataSource.getRepository(Pallet).save(user);
  return res.send(results);
});

pallets.put('/:id', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(Pallet).findOneBy({
    id: req.params.id as unknown as number,
  });
  dataSource.getRepository(Pallet).merge(user, req.body);
  const results = await dataSource.getRepository(Pallet).save(user);
  return res.send(results);
});

pallets.delete('/:id', async function (req: Request, res: Response) {
  const results = await dataSource.getRepository(Pallet).delete(req.params.id);
  return res.send(results);
});

export { pallets };
