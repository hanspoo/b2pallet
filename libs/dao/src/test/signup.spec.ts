import { inicializarCencosud } from '../lib/inicializarCencosud';
import { SignupService } from '../lib/auth/SignupService';

const empresa = 'Alfa Centauro';
const nombre = 'Arnold';
const email = 'arnold@centauro.cl';
const password = '123456';

beforeAll(async () => {
  await inicializarCencosud();
});
describe('registra cliente', () => {
  describe('validaciones', () => {
    it('todos los datos validación ok', async () => {
      const service = new SignupService({ empresa, nombre, email, password });
      const [isOk, msg] = await service.validate();
      expect(isOk).toBe(true);
    });
    it('si falta el nombre error', async () => {
      const service = new SignupService({
        nombre: '',
        empresa,
        email,
        password,
      });
      const [isOk, msg] = await service.validate();
      expect(isOk).toBe(false);
    });
    it('si falta el empresa error', async () => {
      const service = new SignupService({
        nombre,
        empresa: '',
        email,
        password,
      });
      const [isOk, msg] = await service.validate();
      expect(isOk).toBe(false);
    });
    it('si falta el email error', async () => {
      const service = new SignupService({
        nombre,
        empresa,
        email: '',
        password,
      });
      const [isOk, msg] = await service.validate();
      expect(isOk).toBe(false);
    });
    it('si falta la contraseña error', async () => {
      const service = new SignupService({
        nombre,
        empresa,
        email,
        password: '',
      });
      const [isOk, msg] = await service.validate();
      expect(isOk).toBe(false);
    });
  });
  describe('ejecutar', () => {
    it('todos los datos, grabar ok', async () => {
      const service = new SignupService({ nombre, empresa, email, password });
      const e = await service.execute();
      expect(e.nombre).toBe(empresa);
      expect(e.usuarios[0].email).toBe(email);
      expect(e.usuarios[0].nombre).toBe(nombre);
      expect(e.usuarios[0].password).toBeTruthy();
    });
  });
});
