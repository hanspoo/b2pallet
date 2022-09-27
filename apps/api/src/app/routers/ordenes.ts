import * as express from 'express';
import { Request, Response } from 'express';
import multer = require('multer');
import { dataSource, OrdenCompra, UnidadNegocio } from '@flash-ws/dao';
import {
  ClienteService,
  OrdenService,
  PrevalidacionService,
} from '@flash-ws/worker';
import { OrdenesResponseInvalid } from '@flash-ws/api-interfaces';

const ordenes = express.Router();
ordenes.get('/', async function (req: Request, res: Response) {
  const ordenes = await OrdenService.findAll();
  res.json(ordenes);
});

ordenes.get('/:id', async function (req: Request, res: Response) {
  const results = await dataSource.getRepository(OrdenCompra).findOneBy({
    id: req.params.id as unknown as number,
  });
  return res.send(results);
});

ordenes.post('/', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(OrdenCompra).create(req.body);
  const results = await dataSource.getRepository(OrdenCompra).save(user);
  return res.send(results);
});

const upload = multer({ dest: 'uploads/' });

ordenes.post('/masivo', upload.single('file'), async function (req: any, res) {
  // console.log(JSON.stringify(req.body));

  const idUnidad = req.body['unidad'];
  if (!idUnidad) throw Error('Unidad no encontrada');

  const unidades = await dataSource
    .getRepository(UnidadNegocio)
    .find({ where: { id: idUnidad }, relations: { cliente: true } });

  if (unidades.length === 0) throw Error(`No existe la unidad id ${idUnidad}`);

  const unidad = unidades[0];
  unidad.cliente = await ClienteService.findById(unidad.cliente.id);

  try {
    const invalidos: Array<string> = await new PrevalidacionService(
      unidad
    ).validarExcel(req.file.path);

    if (invalidos.length > 0) {
      console.log('Hay productos inválidos (2)');
      const err: OrdenesResponseInvalid = {
        msg: `Hay ${invalidos.length} ${
          invalidos.length === 1 ? 'producto inválido' : 'productos inválidos'
        }`,
        invalidos,
      };
      res.status(400).send(err);
      return;
    }
  } catch (error) {
    console.log('atrapando error 1', JSON.stringify(error));
    res.status(400).send(error);
    return;
  }

  try {
    const service = new OrdenService(unidad);
    const { orden } = await service.crearOrden(req.file.path);
    res.send({ msg: `Orden ${orden.id} creada` });
  } catch (error) {
    // console.log('atrapando error al 2 ', JSON.stringify(error));
    res.status(400).send(error);
  }
});

ordenes.put('/:id', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(OrdenCompra).findOneBy({
    id: req.params.id as unknown as number,
  });
  dataSource.getRepository(OrdenCompra).merge(user, req.body);
  const results = await dataSource.getRepository(OrdenCompra).save(user);
  return res.send(results);
});

ordenes.delete('/:id', async function (req: Request, res: Response) {
  const results = await dataSource
    .getRepository(OrdenCompra)
    .delete(req.params.id);
  return res.send(results);
});

export { ordenes };
