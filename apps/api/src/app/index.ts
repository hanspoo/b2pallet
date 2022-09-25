import * as express from 'express';
import * as cors from 'cors';
import { Request, Response } from 'express';
import { dataSource } from '@flash-ws/dao';
import { Message } from '@flash-ws/api-interfaces';
import { users } from './routers/users';
import { productos } from './routers/productos';
import { ordenes } from './routers/ordenes';

dataSource
  .initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });

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

app.use('/api/users', users);
app.use('/api/productos', productos);
app.use('/api/ordenes', ordenes);

export { app };
