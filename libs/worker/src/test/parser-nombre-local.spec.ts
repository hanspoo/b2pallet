/**
 * Corregir un poco el nombre de local antes de guardarlos
 * Los locales se cargan dinámicamente  a partir de las órdenes.
 */

import { fixNombreLocal } from '@flash-ws/shared';

const l1 = {
  desde: '222-DAL AUGUSTO GROB 1080 LU',
  hasta: 'Dal Augusto Grob 1080 Lu',
};
const l2 = {
  desde: '19-SISA-TEMUCO-AV. PABLO NERUD',
  hasta: 'Sisa Temuco Av. Pablo Nerud',
};
const l3 = {
  desde: '658 - SISA COQUIMBO SINDEMPART',
  hasta: 'Sisa Coquimbo Sindempart',
};
const l4 = {
  desde: 'N848-QUILLOTA SN PEDRO (NERVI',
  hasta: 'Quillota Sn Pedro (nervi',
};

const l6 = { desde: '5-SISA-QUILPUÉ-CARRERA', hasta: 'Sisa Quilpué Carrera' };
const l7 = { desde: 'N703 SISA   CONCHALI', hasta: 'Sisa Conchali' };

describe('formatea nombre locales', () => {
  it('transforma l1', () => {
    expect(fixNombreLocal(l1.desde)).toBe(l1.hasta);
  });
  it('transforma l2', () => {
    expect(fixNombreLocal(l2.desde)).toBe(l2.hasta);
  });
  it('transforma l4', () => {
    expect(fixNombreLocal(l4.desde)).toBe(l4.hasta);
  });
  it('transforma l6', () => {
    expect(fixNombreLocal(l6.desde)).toBe(l6.hasta);
  });
  it('transforma l7', () => {
    expect(fixNombreLocal(l7.desde)).toBe(l7.hasta);
  });
});
