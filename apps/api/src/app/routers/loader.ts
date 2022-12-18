import xlsx from 'node-xlsx';
import { SubirOrdenBody } from '@flash-ws/api-interfaces';
import {
  dataSource,
  Archivo,
  ProcesadorPlanilla,
  configCenco,
  OrdenCreator,
} from '@flash-ws/dao';
import express, { Request, Response } from 'express';

const ordenes = express.Router();

ordenes.post(
  '/subirv2',
  async function (
    req: Request<null, null, SubirOrdenBody, null>,
    res: Response<any>
  ) {
    const { idArchivo } = req.body;

    if (!idArchivo) throw Error('No viene el id del archivo');

    const archivo = await dataSource
      .getRepository(Archivo)
      .findOne({ where: { id: idArchivo } });
    if (!archivo) throw Error(`Archivo id ${idArchivo} no encontrado`);

    try {
      const ws = xlsx.parse(archivo.destination);

      const procesador = new ProcesadorPlanilla(configCenco);

      const result = await procesador.procesar(ws[0]);
      const { ordenes } = await new OrdenCreator(req['empresa']).fromProcesador(
        result
      );

      res.send(ordenes.map((o) => o.id));
    } catch (error) {
      // console.log('atrapando error al 2 ', JSON.stringify(error));
      res.status(400).send(error);
    }
  }
);
