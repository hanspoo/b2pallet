import * as express from 'express';
import { Request, Response } from 'express';
import multer = require('multer');

import {
  ClienteService,
  OrdenService,
  PrevalidacionService,
} from '@flash-ws/worker';
import { dataSource, Local, UnidadNegocio } from '@flash-ws/dao';

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

const upload = multer({ dest: 'uploads/' });

locales.post('/masivo', upload.single('file'), async function (req: any, res) {
  // console.log(JSON.stringify(req.body));

  const nombre = req.headers['x-unidad'];
  console.log(`unidad es ${nombre}`);

  if (!nombre) throw Error('Unidad no encontrada');
  const unidades = await dataSource
    .getRepository(UnidadNegocio)
    .find({ where: { nombre }, relations: { cliente: true } });

  if (unidades.length === 0)
    throw Error(`No existe la unidad con nombre ${nombre}`);

  const unidad = unidades[0];
  unidad.cliente = await ClienteService.findById(unidad.cliente.id);

  try {
    const invalidos: Array<string> = await new PrevalidacionService(
      unidad
    ).validarExcel(req.file.path);

    if (invalidos.length > 0) {
      console.log('Hay productos inválidos (1)');
      res.status(400).send(invalidos);
    }
  } catch (error) {
    console.log('atrapando error ', JSON.stringify(error));
    res.status(400).send(error);
  }

  try {
    const service = new OrdenService(unidad);
    const status = await service.crearOrden(req.file.path);
  } catch (error) {
    console.log('atrapando error al ', JSON.stringify(error));
    res.status(400).send(error);
  }

  res.send({ status: 'Bingo' });
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
