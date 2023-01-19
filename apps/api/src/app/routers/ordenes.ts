import fs from 'fs';
import * as express from 'express';
import { Request, Response } from 'express';
import multer = require('multer');
import {
  Archivo,
  consolidaPallets,
  dataSource,
  OrdenCompra,
  Pallet,
  palletsCajas,
  Producto,
  ProtoPallet,
  ServicioOrdenes,
  ServicioPallets,
  ultimaHUCliente,
  UnidadNegocio,
} from '@flash-ws/dao';
import { EtiquetasService } from '@flash-ws/etiquetas';
import {
  ClienteService,
  Consolidado,
  LineaConsolidada,
  ordenarPorNombreProducto,
  OrdenService,
  PrevalidacionService,
  ServicioCambioEstado,
} from '@flash-ws/worker';
import {
  BodyCambioEstadoProdConsolidada,
  BodyGenPallets,
  CambiarEstadoBody,
  EstadoLinea,
  EtiquetaPallet,
  IConsolidadoCajas,
  IPalletConsolidado,
  OrdenesResponseInvalid,
  SubirOrdenBody,
} from '@flash-ws/api-interfaces';

import { SuperOrden } from '@flash-ws/dao';
import { PalletRobot, PalletRobotConfig } from '@flash-ws/robot';
import { ifDebug } from '@flash-ws/shared';
import { In } from 'typeorm';
import { fstat } from 'fs';
import { restoreDashPattern } from 'pdf-lib';

const ordenes = express.Router();

ordenes.get('/consolidadas', async function (req: Request, res: Response) {
  const ordenes = await new ServicioOrdenes(req['empresa']).ordenes();
  res.json(ordenes);
});
ordenes.get('/', async function (req: Request, res: Response) {
  // const ordenes = await OrdenService.findAll();
  // const conConsolidada = ordenes.map(async (o) => {
  //   const orden = o as unknown as SuperOrden;
  //   const c = new Consolidado(o.lineas);
  //   await c.calcular();
  //   orden.lineasConsolidadas = (await ordenarPorNombreProducto(
  //     c.lineas
  //   )) as Array<LineaConsolidada>;
  //   return orden;
  // });
  // res.json(await Promise.all(conConsolidada));
  return [];
});

ordenes.get('/:id/consolidada', async function (req: Request, res: Response) {
  const id = req.params.id;
  if (!id) throw Error('No viene el id, cancelando petición REST');
  const results = await dataSource.getRepository(OrdenCompra).find({
    where: { id },
    relations: { lineas: true },
  });

  const orden = results[0];
  if (!orden) throw Error(`orden id ${id} no encontrada`);

  const c = new Consolidado(orden.lineas);
  await c.calcular();
  return res.send(c.lineas);
});
ordenes.get('/:id/ultima-hu', async function (req: Request, res: Response) {
  const id = req.params.id;
  if (!id) throw Error('No viene el id, cancelando petición REST');
  const orden = await dataSource.getRepository(OrdenCompra).findOne({
    where: { id },
    relations: { cliente: true },
  });

  if (!orden) throw Error(`orden id ${id} no encontrada`);

  const hu = await ultimaHUCliente(orden.cliente.id);

  return res.send({ hu });
});

type RequestWithId = {
  id: string;
};
ordenes.get(
  '/:id/pallets',
  async function (req: Request<RequestWithId>, res: Response) {
    const id = req.params.id;
    if (!id) throw Error('No viene el id, cancelando petición REST');
    const results = await dataSource.getRepository(OrdenCompra).find({
      where: { id },
      relations: { pallets: true },
    });

    const orden = results[0];
    if (!orden) throw Error(`orden id ${id} no encontrada`);

    return res.send(orden);
  }
);
ordenes.get(
  '/:id/etiquetas',
  async function (req: Request<RequestWithId>, res: Response) {
    const id = req.params.id;
    if (!id) throw Error('No viene el id de orden de compra');
    const orden = await dataSource.getRepository(OrdenCompra).findOne({
      where: { id },
    });
    if (!orden)
      return res.status(404).send({ msg: `orden ${id} no encontrada` });

    const service = new EtiquetasService(orden);
    const etiPallets = await service.etiquetasPallets();
    const path = await service.genPdf(etiPallets);

    const file = fs.createReadStream(path);
    const stat = fs.statSync(path);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=etiquetas.pdf');
    file.pipe(res);
  }
);

ordenes.get(
  '/:id',
  async function (req: Request<RequestWithId>, res: Response) {
    const orden = (await dataSource.getRepository(OrdenCompra).findOne({
      where: { id: req.params.id },
      relations: ['lineas', 'cliente'],
    })) as SuperOrden;

    console.log('orden', orden);

    const c = new Consolidado(orden.lineas);
    await c.calcular();
    orden.lineasConsolidadas = (await ordenarPorNombreProducto(
      c.lineas
    )) as Array<LineaConsolidada>;
    return res.send(orden);
  }
);
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
    req: Request<{ id: string }, null, CambiarEstadoBody>,
    res: Response
  ) {
    try {
      const servicio = new ServicioCambioEstado();

      try {
        await servicio.loadOrden(req.params.id);
      } catch (error) {
        return res
          .status(404)
          .send({ message: `Orden ${req.params.id} no existe` });
      }

      const ids = req.body.ids;
      const nueva = (await servicio.cambiar(
        ids,
        req.body.estado
      )) as SuperOrden;

      const consolidada: Consolidado = new Consolidado(nueva.lineas);
      await consolidada.calcular();

      nueva.lineasConsolidadas = (await ordenarPorNombreProducto(
        consolidada.lineas
      )) as Array<LineaConsolidada>;

      return res.send(nueva);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

ordenes.post(
  '/cambiar-estado-consolidada/:id',
  async function (
    req: Request<{ id: string }, null, BodyCambioEstadoProdConsolidada>,
    res: Response
  ) {
    const idOrden = req.params.id;

    const estado = req.body.estado;
    const productos = req.body.productos;

    if (!idOrden) return res.status(400).send(`Debe entregar la orden`);
    if (!productos) return res.status(400).send(`Debe entregar los productos`);
    if (productos.length === 0)
      return res.status(400).send(`No vienen productos`);
    if (!estado) return res.status(400).send(`Debe entregar el estado`);
    if (!EstadoLinea[estado])
      return res.status(400).send(`Estado ${estado} inválido`);

    const rows = await dataSource
      .getRepository(Producto)
      .find({ where: { id: In(productos) } });
    if (rows.length === 0)
      return res
        .status(400)
        .send(`Productos inválidos: ${productos.join(',')}`);

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.manager.query(
      `update linea_detalle set estado = '${estado}' where "ordenCompraId" = '${idOrden}' and "productoId" in (${productos.join(
        ','
      )}) `
    );
    queryRunner.release();

    const results = await dataSource.getRepository(OrdenCompra).find({
      where: { id: idOrden },
      relations: { lineas: true },
    });
    const orden = results[0] as SuperOrden;
    const c = new Consolidado(orden.lineas);
    await c.calcular();
    orden.lineasConsolidadas = (await ordenarPorNombreProducto(
      c.lineas
    )) as Array<LineaConsolidada>;

    return res.send(orden);
  }
);

ordenes.post(
  '/:id/gen-pallets',
  async function (
    req: Request<{ id: string }, null, BodyGenPallets>,
    res: Response
  ) {
    ifDebug('1');
    const repo = dataSource.getRepository(OrdenCompra);
    ifDebug('1.1');
    const ordenes = await repo.find({
      where: { id: req.params.id },
      relations: [
        'lineas',
        'lineas.cajas',
        'lineas.cajas.linea',
        'lineas.cajas.linea.producto',
        'lineas.cajas.linea.producto.box',
        'lineas.producto',
      ],
    });
    ifDebug('2');
    if (ordenes.length !== 1)
      return res.status(400).send(`Orden ${req.params.id} no encontrada`);

    const orden = ordenes[0];
    const { protoID, nextHU, ordenar, distribuir } = req.body;

    let hu = nextHU;
    if (!hu) {
      const s = new ServicioPallets();
      hu = await s.ultimaHU();
      hu++;
    }

    const repoPallets = dataSource.getRepository(Pallet);
    ifDebug('3');

    async function borrarPalletsActuales() {
      ifDebug('3.1');
      const pallets = await repoPallets.find({
        where: { ordenCompraId: orden.id },
      });
      ifDebug('3.2');

      await repoPallets.remove(pallets);
    }
    await borrarPalletsActuales();

    ifDebug('4');

    const robotConfig: PalletRobotConfig = { ordenar, distribuir };
    const robot = new PalletRobot(orden, robotConfig);
    const proto = await dataSource
      .getRepository(ProtoPallet)
      .findOne({ where: { id: protoID }, relations: { box: true } });
    ifDebug('4');
    orden.pallets = await robot.generarPallets(proto);
    orden.pallets.forEach((pallet) => (pallet.hu = hu++));
    ifDebug('hay orden.pallets:' + orden.pallets.length);

    // ifDebug(orden.pallets[0].cajas + '');

    await dataSource.getRepository(Pallet).save(orden.pallets);

    const pallets = await consolidaPallets(req.params.id);
    ifDebug('7');

    return res.send(pallets as unknown as IPalletConsolidado[]);
  }
);
ordenes.get(
  '/:id/pallets-cajas',
  async function (req: Request<{ id: string }, null, null>, res: Response) {
    const cajas: IConsolidadoCajas[] = await palletsCajas(req.params.id);

    return res.send(cajas);
  }
);
ordenes.get(
  `/:id/pallets/:palletID/epallet`,
  async function (
    req: Request<{ id: string; palletID: number }, null, null>,
    res: Response
  ) {
    const { id, palletID } = req.params;

    if (!id) throw Error('No viene el id de orden de compra');
    if (!palletID) throw Error('No viene el id del pallet');

    const orden = await dataSource
      .getRepository(OrdenCompra)
      .findOne({ where: { id: id } });
    if (!orden) throw Error(`Orden ${id} no encontrada`);

    const s = new EtiquetasService(orden);
    const eps = await s.etiquetasPallets(palletID);
    if (!eps || eps.length === 0)
      throw Error(`Pallet ${palletID} no encontrado para orden ${id}`);

    return res.send(eps[0]);
  }
);

ordenes.get(
  '/:id/pallets-cons',
  async function (req: Request<{ id: string }, null, null>, res: Response) {
    const pallets = await consolidaPallets(req.params.id);

    return res.send(pallets as unknown as IPalletConsolidado[]);
  }
);

ordenes.post(
  '/subir',
  async function (
    req: Request<null, null, SubirOrdenBody, null>,
    res: Response<any>
  ) {
    const { idUnidad, idArchivo } = req.body;

    if (!idUnidad) throw Error('No viene la unidad de negocio');
    if (!idArchivo) throw Error('No viene el id del archivo');

    const unidad = await dataSource.getRepository(UnidadNegocio).findOne({
      where: { id: idUnidad },
      relations: { cliente: true, ordenes: true },
    });

    if (!unidad) throw Error(`No existe la unidad id ${idUnidad}`);

    unidad.cliente = await ClienteService.findById(unidad.cliente.id);
    const archivo = await dataSource
      .getRepository(Archivo)
      .findOne({ where: { id: idArchivo } });
    if (!archivo) throw Error(`Archivo id ${idArchivo} no encontrado`);

    try {
      const { error, ordenesDuplicadas, productosNoEncontrados } =
        await new PrevalidacionService(unidad).validarExcel(archivo.path);

      if (error) {
        const err: OrdenesResponseInvalid = {
          msg: `Hay información inválida`,
          errores: [...ordenesDuplicadas, ...productosNoEncontrados],
        };
        res.status(400).send(err);
        return;
      }
    } catch (error) {
      console.log('atrapando error 1.1', JSON.stringify(error));
      res.status(400).send({ msg: 'Error grave en el archivo' });
      return;
    }

    // console.log(3);

    try {
      const service = new OrdenService(unidad);
      const { ordenes } = await service.crearOrden(archivo.path);

      res.send(ordenes.map((o) => o.id));
    } catch (error) {
      // console.log('atrapando error al 2 ', JSON.stringify(error));
      res.status(400).send(error);
    }
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
        errores: [...ordenesDuplicadas, ...productosNoEncontrados],
      };
      res.status(400).send(err);
      return;
    }
  } catch (error) {
    console.log('atrapando error 1.2', JSON.stringify(error));
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
    id: req.params.id,
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

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};
