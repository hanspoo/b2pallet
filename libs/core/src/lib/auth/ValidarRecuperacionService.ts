import { randomBytes } from "crypto";
import { dataSource } from "../data-source";
import { SolicitudRecupPassword } from "../entity/auth/solicitud-recup-password.entity";
import { PermisoModifCuenta } from "../entity/auth/permiso-modif-cuenta.entity";

export type ValidaSolicitudAutenticarEmailResponse = {
  success: boolean;
  msg: string;
  permiso?: PermisoModifCuenta;
};

export class ValidaSolicitudAutenticarEmail {
  async execute(
    email: string,
    cseg: number
  ): Promise<ValidaSolicitudAutenticarEmailResponse> {
    const repoSol = dataSource.getRepository(SolicitudRecupPassword);
    const repoPermiso = dataSource.getRepository(PermisoModifCuenta);
    const solicitud = await repoSol.findOne({
      where: { email, cseg, vigente: true },
    });
    if (solicitud) {
      await repoSol.save({ ...solicitud, vigente: false });
      const token = genRandomToken();
      const permiso = await repoPermiso.save(
        repoPermiso.create({ token, email })
      );

      return { success: true, msg: "Ok", permiso };
    } else {
      return { success: false, msg: "VS0001" };
    }
  }
}
function genRandomToken() {
  return randomBytes(32).toString("base64");
}
