import * as express from 'express';
import { Request, Response } from 'express';
import multer = require('multer');

import { dataSource, Cliente, ultimaHUCliente } from '@flash-ws/core';

const clientes = express.Router();
clientes.get('/', async function (req: Request, res: Response) {
  const clientes = await dataSource.getRepository(Cliente).find({});
  res.json(clientes);
});

clientes.get('/:id', async function (req: Request, res: Response) {
  const results = await dataSource.getRepository(Cliente).findOneBy({
    id: req.params.id as unknown as number,
  });
  return res.send(results);
});
clientes.get(
  '/:id/ultima-hu',
  async function (req: Request<{ id: number }>, res: Response) {
    const hu = await ultimaHUCliente(req.params.id);

    return res.send({ hu });
  }
);

clientes.post('/', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(Cliente).create(req.body);
  const results = await dataSource.getRepository(Cliente).save(user);
  return res.send(results);
});

clientes.put('/:id', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(Cliente).findOneBy({
    id: req.params.id as unknown as number,
  });
  dataSource.getRepository(Cliente).merge(user, req.body);
  const results = await dataSource.getRepository(Cliente).save(user);
  return res.send(results);
});

clientes.delete('/:id', async function (req: Request, res: Response) {
  const results = await dataSource.getRepository(Cliente).delete(req.params.id);
  return res.send(results);
});

export { clientes };
