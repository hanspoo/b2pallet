import { SolicitudRecupPassword } from "../entity/auth/solicitud-recup-password.entity";

export type RecoverPasswordServiceResult = {
  success: boolean;
  msg: string;
  solicitud?: SolicitudRecupPassword;
};
