import fs from 'fs';
import xlsx from 'node-xlsx';
import { LoaderPostBody } from '@flash-ws/api-interfaces';
import {
  dataSource,
  Archivo,
  ProcesadorPlanilla,
  configCenco,
  OrdenCreator,
} from '@flash-ws/dao';
import express, { Request, Response } from 'express';

export const loader = express.Router();

loader.post(
  '/subir',
  async function (
    req: Request<null, null, LoaderPostBody, null>,
    res: Response<any>
  ) {
    const { idArchivo } = req.body;

    if (!idArchivo) {
      return res
        .status(400)
        .send({ msg: 'LDR001: No viene el id del archivo' });
    }

    const archivo = await dataSource
      .getRepository(Archivo)
      .findOne({ where: { id: idArchivo } });
    if (!archivo) {
      return res
        .status(400)
        .send({ msg: `LDR002: Archivo ${idArchivo} no encontrado` });
    }

    if (!fs.existsSync(archivo.path)) {
      const msg = `LDR003: Archivo path: ${archivo.path} no existe en el sistema`;
      console.log(archivo);
      return res.status(400).send({ msg });
    }

    try {
      const ws = xlsx.parse(archivo.path);

      const procesador = new ProcesadorPlanilla(configCenco);

      const result = await procesador.procesar(ws[0]);
      const { ordenes } = await new OrdenCreator(req['empresa']).fromProcesador(
        result
      );

      res.send(ordenes.map((o) => o.id));
    } catch (error) {
      console.log('atrapando error al 2 ', JSON.stringify(error));
      res.status(400).send({ msg: 'LDR006: Error procesando la planilla' });
    }
  }
);
