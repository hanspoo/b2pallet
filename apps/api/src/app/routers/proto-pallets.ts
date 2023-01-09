import * as express from 'express';
import { Request, Response } from 'express';
import { dataSource, ProtoPallet } from '@flash-ws/dao';
import { AddProtoPalletArgs } from '@flash-ws/api-interfaces';

const protoPallets = express.Router();
protoPallets.get('/', async function (req: Request, res: Response) {
  const protoPallets = await dataSource
    .getRepository(ProtoPallet)
    .find({ relations: ['box'], where: { empresa: req['empresa'] } });
  res.json(protoPallets);
});

protoPallets.get('/:id', async function (req: Request, res: Response) {
  const results = await dataSource.getRepository(ProtoPallet).findOneBy({
    id: req.params.id as unknown as number,
  });
  return res.send(results);
});

protoPallets.post(
  '/',
  async function (req: Request<null, null, AddProtoPalletArgs>, res: Response) {
    const protoPallet = await dataSource
      .getRepository(ProtoPallet)
      .create({ ...req.body, empresa: req['empresa'] });
    const results = await dataSource
      .getRepository(ProtoPallet)
      .save(protoPallet);
    return res.send(results);
  }
);

protoPallets.put('/:id', async function (req: Request, res: Response) {
  const protoPallet = await dataSource.getRepository(ProtoPallet).findOneBy({
    id: req.params.id as unknown as number,
  });
  dataSource.getRepository(ProtoPallet).merge(protoPallet, req.body);
  const results = await dataSource.getRepository(ProtoPallet).save(protoPallet);
  return res.send(results);
});

protoPallets.delete('/:id', async function (req: Request, res: Response) {
  const results = await dataSource
    .getRepository(ProtoPallet)
    .delete(req.params.id);
  return res.send(results);
});

export { protoPallets };
