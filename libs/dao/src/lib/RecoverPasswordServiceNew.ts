import nodemailer from "nodemailer";
import { dataSource } from "./data-source";
import { Usuario } from "./entity/auth/usuario.entity";
import { SolicitudRecupPassword } from "./entity/auth/solicitud-recup-password.entity";

type RecoverPasswordServiceResult = {
  success: boolean;
  msg: string;
};

export class RecoverPasswordServiceNew {
  codigoSeguridad: any;
  constructor(public email: string) {}

  async execute(): Promise<RecoverPasswordServiceResult> {
    const email = cleanupEmail(this.email);
    if (!isValidEmail(this.email)) {
      return { success: false, msg: `RPA001: Email ${email} es inválido` };
    }
    const repoUsr = dataSource.getRepository(Usuario);
    const usuario = await repoUsr.findOne({
      where: { email: this.email.toLowerCase().trim() },
    });
    const repoSol = dataSource.getRepository(SolicitudRecupPassword);

    const transporter = nodemailer.createTransport({
      host: process.env.NX_SMTP_SERVER || "smtp.gmail.com",
      port: process.env.NX_SMTP_PORT || 587,
      auth: {
        user: process.env.NX_SMTP_USER,
        pass: process.env.NX_SMTP_PASS,
      },
    });
    transporter.verify().then(console.log).catch(console.error);

    const response = transporter.sendMail({
      from: '"Hans Poo" <hanscpoo@welinux.cl>', // sender address
      to: this.email,
      subject: "Registro en b2pallet",
      text: `
        Hola,

        Para activar su nueva cuenta b2pallet, copie y pegue este código de confirmación de seis dígitos en la pantalla de su navegador.
        
        ${this.codigoSeguridad}
        
        Si no encuentra dónde introducir el código, vuelva a introducir su correo electrónico aquí..

        El equipo de b2pallet
        ¿Necesita ayuda? Póngase en contacto con nosotros.        
        `,
      html: `
        <p>Hola,</p>

        <p> Para activar su nueva cuenta b2pallet, copie y pegue este c&oacute;digo de confirmaci&oacute;n de seis d&iacute;gitos en la pantalla de su navegador.</p>
         
         <h1>${this.codigoSeguridad}</h1>
         
         <p>Si no encuentra d&oacute;nde introducir el c&oacute;digo,&#160;vuelva a introducir su correo electr&oacute;nico aqu&iacute;..</p>
        
        <p> El equipo de b2pallet<br>
         &iquest;Necesita ayuda?&#160;P&oacute;ngase en contacto con nosotros.</p>        
        `,
    });

    return response;
  }
}
