import * as express from 'express';
import { Request, Response } from 'express';
import multer = require('multer');

import {
  ClienteService,
  OrdenService,
  PrevalidacionService,
} from '@flash-ws/worker';
import { dataSource, UnidadNegocio } from '@flash-ws/dao';

const unidades = express.Router();
unidades.get('/', async function (req: Request, res: Response) {
  const unidades = await dataSource.getRepository(UnidadNegocio).find({});
  res.json(unidades);
});

unidades.get('/:id', async function (req: Request, res: Response) {
  const results = await dataSource.getRepository(UnidadNegocio).findOneBy({
    id: req.params.id as unknown as number,
  });
  return res.send(results);
});

unidades.post('/', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(UnidadNegocio).create(req.body);
  const results = await dataSource.getRepository(UnidadNegocio).save(user);
  return res.send(results);
});

const upload = multer({ dest: 'uploads/' });

unidades.post('/masivo', upload.single('file'), async function (req: any, res) {
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
    const resultado = await new PrevalidacionService(unidad).validarExcel(
      req.file.path
    );

    if (resultado.error) {
      console.log('Hay productos inválidos (3');
      res.status(400).send(resultado);
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

unidades.put('/:id', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(UnidadNegocio).findOneBy({
    id: req.params.id as unknown as number,
  });
  dataSource.getRepository(UnidadNegocio).merge(user, req.body);
  const results = await dataSource.getRepository(UnidadNegocio).save(user);
  return res.send(results);
});

unidades.delete('/:id', async function (req: Request, res: Response) {
  const results = await dataSource
    .getRepository(UnidadNegocio)
    .delete(req.params.id);
  return res.send(results);
});

export { unidades };
