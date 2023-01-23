import {
  ActivationRequest,
  ActivationResponse,
  LoginRequest,
  RecoverPasswordRequest,
  SignupRequest,
} from "@flash-ws/api-interfaces";
import {
  CrearUsuarioService,
  FinderSolicitudesRegistro,
  LoginService,
  SignupService,
} from "@flash-ws/dao";
import * as express from "express";
import { Request, Response } from "express";

const auth = express.Router();

type ReqWithSession = Request<unknown, unknown, LoginRequest> & {
  session: {
    token: string;
    user: string;
    admin: boolean;
    destroy: () => void;
  };
};

auth.post("/login", async function (req: ReqWithSession, res: Response) {
  if (!req.body.email || !req.body.password) {
    return res.send("please give username and password");
  }

  const { email, password } = req.body;

  if (!(/\w+@\w+/.test(email) && /\w+/.test(password))) {
    console.log(`email: ${email}, o contraseña inválida: ${password}`);
    return res.send(`No hemos encontrado ninguna cuenta asociada a ese email`);
  }

  const [loginOk, payload] = await new LoginService().login(email, password);

  if (loginOk) {
    req.session.user = req.body.email;
    req.session.admin = true;
    req.session.token = payload;
    return res.header("x-token", payload).send("login Ok");
  }

  res.send("Credenciales inválidas");
});
auth.post(
  "/signup",
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

auth.post(
  "/activate",
  async function (
    req: Request<null, ActivationResponse, ActivationRequest>,
    res: Response
  ) {
    const finder = new FinderSolicitudesRegistro();
    const { cseg, email } = req.body;

    const response = await finder.execute(email, parseInt(cseg + ""));
    if (!response.success) return res.send(response);

    const scu = new CrearUsuarioService();
    const e = await scu.crearDesdeSolicitud(response.solicitud);
    if (e) return res.send(response);
    else {
      const errorResponse: ActivationResponse = {
        msg: "Error al crear la cuenta",
      };
      res.status(400).send(errorResponse);
    }
  }
);
auth.post(
  "/recover-pass",
  async function (
    req: Request<null, null, RecoverPasswordRequest>,
    res: Response
  ) {
    const { email } = req.body;

    // const service = new RecoverPasswordService();
    // const response = await service.execute(email);
    // res.send(response);
  }
);

auth.get("/logout", function (req: ReqWithSession, res) {
  req.session.destroy();
  res.send("logout success!");
});

auth.get("/content", auth, function (req, res) {
  res.send("You can only see this after you've logged in.");
});

export { auth };
