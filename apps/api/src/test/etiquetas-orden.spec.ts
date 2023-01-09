// process.env.NODE_ENV = 'dev';
import { crearArchivoValido, crearArchivoInvalido } from './utils';
import { LoaderPostBody } from '@flash-ws/api-interfaces';
import {
    Archivo,
    crearProductoPrueba,
    dataSource,
    inicializarSistema,
    obtainToken,
    OrdenCompra,
    Producto,
} from '@flash-ws/dao';
import request from 'supertest';
import { app } from '../app';

let token: string;

let archValido: Archivo;
let archInvalido: Archivo;

beforeAll(async () => {
    await inicializarSistema();
    await crearProductoPrueba();
    archValido = await crearArchivoValido();
    archInvalido = await crearArchivoInvalido();
    token = await obtainToken();
});

describe("pdf con etiquetas de pallets", () => {
    it("sin token debe dar 401", async () => {
        const url = "/api/ordenes/f793cad5-490a-41ef-9d9f-bec34737f868/etiquetas";
        const res = await request(app)
            .get(url)

        expect(res.status).toBe(401)

    })
})