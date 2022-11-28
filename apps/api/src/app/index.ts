import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import { Message } from '@flash-ws/api-interfaces';
import { users } from './routers/users';
import { productos } from './routers/productos';
import { ordenes } from './routers/ordenes';
import { files } from './routers/files';
import { locales } from './routers/locales';
import { unidades } from './routers/unidades';
import { pallets } from './routers/pallets';
import { clientes } from './routers/clientes';
import { archivos } from './routers/archivos';

// create and setup express app
const app = express();
app.use(cors());
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.url);

  next();
});
app.use(express.json());
app.use(express.static('../flash'));

const greeting: Message = { message: 'Welcome to the api!' };

app.get('/api', (req, res) => {
  res.send(greeting);
});

// register routes
// app.get('/', async function (req: Request, res: Response) {
//   res.json({ name: 'Hello' });
// });

app.use('/api/files', files);
app.use('/api/archivos', archivos);
app.use('/api/users', users);
app.use('/api/productos', productos);
app.use('/api/ordenes', ordenes);
app.use('/api/unidades', unidades);
app.use('/api/locales', locales);
app.use('/api/clientes', clientes);
app.use('/api/pallets', pallets);

export { app };
