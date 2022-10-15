import * as express from 'express';
import { Request, Response } from 'express';
import multer = require('multer');
import { dataSource, OrdenCompra, UnidadNegocio } from '@flash-ws/dao';
import {
  ClienteService,
  OrdenService,
  PrevalidacionService,
  ServicioCambioEstado,
} from '@flash-ws/worker';
import {
  CambiarEstadoBody,
  EstadoLinea,
  OrdenesResponseInvalid,
} from '@flash-ws/api-interfaces';

const ordenes = express.Router();
ordenes.get('/', async function (req: Request, res: Response) {
  const ordenes = await OrdenService.findAll();
  res.json(ordenes);
});

ordenes.get('/:id', async function (req: Request, res: Response) {
  const id = req.params.id as unknown as number;
  const results = await dataSource.getRepository(OrdenCompra).find({
    where: { id },
    relations: { lineas: true },
  });
  return res.send(results[0]);
});

ordenes.post('/', async function (req: Request, res: Response) {
  const user = await dataSource.getRepository(OrdenCompra).create(req.body);
  const results = await dataSource.getRepository(OrdenCompra).save(user);
  return res.send(results);
});

const upload = multer({ dest: 'uploads/' });
ordenes.post('/borrar', async function (req: Request, res: Response) {
  await OrdenService.borrarIds(req.body);
  return res.send({ msg: 'Bingo' });
});

ordenes.post(
  '/cambiar-estado/:id',
  async function (
    req: Request<{ id: number }, null, CambiarEstadoBody>,
    res: Response
  ) {
    const servicio = new ServicioCambioEstado();
    await servicio.loadOrden(req.params.id);
    const ids = req.body.ids;
    const nueva = await servicio.cambiar(ids, req.body.estado);

    return res.send(nueva);
  }
);

ordenes.post('/masivo', upload.single('file'), async function (req: any, res) {
  // console.log(1);
  const idUnidad = req.body['unidad'];
  if (!idUnidad) throw Error('Unidad no encontrada');

  const unidades = await dataSource.getRepository(UnidadNegocio).find({
    where: { id: idUnidad },
    relations: { cliente: true, ordenes: true },
  });

  if (unidades.length === 0) throw Error(`No existe la unidad id ${idUnidad}`);

  // console.log(2);

  const unidad = unidades[0];
  unidad.cliente = await ClienteService.findById(unidad.cliente.id);

  try {
    const { error, ordenesDuplicadas, productosNoEncontrados } =
      await new PrevalidacionService(unidad).validarExcel(req.file.path);

    if (error) {
      const err: OrdenesResponseInvalid = {
        msg: `Hay información inválida`,
        ordenesDuplicadas,
        productosNoEncontrados,
      };
      res.status(400).send(err);
      return;
    }
  } catch (error) {
    console.log('atrapando error 1', JSON.stringify(error));
    res.status(400).send(error);
    return;
  }

  // console.log(3);

  try {
    const service = new OrdenService(unidad);
    const { ordenes } = await service.crearOrden(req.file.path);
    res.send({ msg: `Se crearon/actualizaron ${ordenes.length} orden(es)` });
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
