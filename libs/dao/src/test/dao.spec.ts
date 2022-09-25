// Antes de comenzar las pruebas el cliente y sus unidades de negocio están creadas

import { Cliente } from '../lib/entity/cliente.entity';
import { inicializarCencosud } from '../lib/inicializarCencosud';

let cliente: Cliente;

beforeAll(async () => {
  cliente = await inicializarCencosud();
});

describe('Prueba fixture local', () => {
  it('Crea cencosud', () => {
    expect(cliente).toBeTruthy();
  });
  it('Crea las dos unidades haciendo save en cascada', () => {
    expect(cliente.unidades.length).toBe(2);
  });
  it('Las unidades quedan referenciando el cliente', () => {
    expect(cliente.unidades[0].cliente).toBe(cliente);
  });
});
