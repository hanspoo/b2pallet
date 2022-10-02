import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';
import { Message } from '@flash-ws/api-interfaces';
import { users } from './routers/users';
import { productos } from './routers/productos';
import { ordenes } from './routers/ordenes';
import { files } from './routers/files';
import { locales } from './routers/locales';
import { unidades } from './routers/unidades';

// create and setup express app
const app = express();
app.use(cors());
app.use(express.json());

const greeting: Message = { message: 'Welcome to the api!' };

app.get('/api', (req, res) => {
  res.send(greeting);
});

// register routes
app.get('/', async function (req: Request, res: Response) {
  res.json({ name: 'Hello' });
});

app.use('/api/files', files);
app.use('/api/users', users);
app.use('/api/productos', productos);
app.use('/api/ordenes', ordenes);
app.use('/api/unidades', unidades);
app.use('/api/locales', locales);

export { app };
