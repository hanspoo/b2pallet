import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import { Message } from '@flash-ws/api-interfaces';
import { auth } from './routers/auth';
import { users } from './routers/users';
import { productos } from './routers/productos';
import { ordenes } from './routers/ordenes';
import { files } from './routers/files';
import { locales } from './routers/locales';
import { unidades } from './routers/unidades';
import { pallets } from './routers/pallets';
import { clientes } from './routers/clientes';
import { archivos } from './routers/archivos';
import { TokenService } from '@flash-ws/dao';

type ReqWithSession = Request<
  unknown,
  unknown,
  { username: string; password: string }
> & {
  session: {
    user: string;
    admin: boolean;
    destroy: () => void;
  };
};

// create and setup express app
const app = express();
app.use(
  cors({
    exposedHeaders: ['*'],
    credentials: true,
  })
);
app.use(
  session({
    secret: 'E67C-4683-B5BB2A87EE025E92',
    resave: true,
    saveUninitialized: true,
  })
);

app.use((req: Request, res: Response, next: NextFunction) => {
  if (process.env.DEBUG) console.log(req.url);

  next();
});
app.use(express.json());
app.use(express.static('../flash'));
const authMiddleware = async function (
  req: ReqWithSession,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers['authorization'];
  if (authorization) {
    const [, token] = authorization.trim().split(/ /);
    if (token) {
      const t = await new TokenService().find(token);
      if (!t) {
        return res.status(401).send(`Token ${token} no encontrado`);
      }
      req['user'] = t.usuario;

      return next();
    }
  }
  if (req.session && req.session.user === 'jose' && req.session.admin)
    return next();
  else return res.sendStatus(401);
};

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
app.use('/api/auth', auth);
app.use('/api/productos', authMiddleware, productos);
app.use('/api/ordenes', authMiddleware, ordenes);
app.use('/api/unidades', unidades);

app.use('/api/locales', locales);
app.use('/api/clientes', clientes);
app.use('/api/pallets', pallets);

export { app };
