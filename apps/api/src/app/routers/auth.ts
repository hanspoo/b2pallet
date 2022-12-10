import { LoginRequest, SignupRequest } from '@flash-ws/api-interfaces';
import { LoginService, SignupService } from '@flash-ws/dao';
import * as express from 'express';
import { Request, Response } from 'express';

const auth = express.Router();

type ReqWithSession = Request<unknown, unknown, LoginRequest> & {
  session: {
    token: string;
    user: string;
    admin: boolean;
    destroy: () => void;
  };
};

auth.post('/login', async function (req: ReqWithSession, res: Response) {
  if (!req.body.email || !req.body.password) {
    return res.send('please give username and password');
  }

  const [loginOk, payload] = await new LoginService().login(
    req.body.email,
    req.body.password
  );

  if (loginOk) {
    req.session.user = req.body.email;
    req.session.admin = true;
    req.session.token = payload;
    return res.header('x-token', payload).send('login Ok');
  }

  res.send('invalid credentials');
});
auth.post(
  '/signup',
  async function (req: Request<null, null, SignupRequest>, res: Response) {
    const service = new SignupService(req.body);
    const [isOk, errors] = await service.validate();

    if (!isOk) {
      return res.status(400).send(errors);
    }

    const e = await service.execute();

    res.send(e);
  }
);

auth.get('/logout', function (req: ReqWithSession, res) {
  req.session.destroy();
  res.send('logout success!');
});

auth.get('/content', auth, function (req, res) {
  res.send("You can only see this after you've logged in.");
});

export { auth };
