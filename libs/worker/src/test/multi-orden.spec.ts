import * as xlsx from 'xlsx';
/**
 * de un archivo b2b pueden venir varias ordendes, lo único es que cada orden debe ser
 * para una misma unidad de negocio.
 *
 *
 * */

// dada una planilla con una orden y una unidad de negocio, crear una unidad de negocio y una orden.

type Analisis = {
  ordenes: number[];
  unidades: string[];
  productos: string[];
};

const write_opts: xlsx.WritingOptions = {
  type: 'file',
  cellDates: false,
  bookSST: false,
  bookType: 'xlsx',
  sheet: 'Sheet1',
  compression: false,
  Props: {
    Author: 'Someone',
    Company: 'SheetJS LLC',
  },
};

describe('crear fixture', () => {
  it('puede crear planilla', () => {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet([
      ['SheetJS', '<3', 'விரிதாள்'],
      [72, 1, 'Arbeitsblätter'],
      [1, 62, '数据'],
      [true, false],
    ]);
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    xlsx.writeFile(wb, 'textport.numbers', write_opts);
  });
});
describe('analisis multiple del b2b', () => {
  describe('dada una planilla con una orden y una unidad de negocio', () => {
    it('debe crear una unidad de negocio y una orden', () => {
      const res: Analisis = new ProcesadorB2b().analizarPlanilla(
        'fixtures/orden-una-linea.xls'
      );
      expect(res.ordenes.length).toBe(1);
      expect(res.unidades.length).toBe(1);
      expect(res.productos.length).toBe(1);
    });
    it('debe crear la orden 5575426472', () => {
      const res: Analisis = new ProcesadorB2b().analizarPlanilla(
        'fixtures/orden-una-linea.xls'
      );
      expect(res.ordenes[0]).toBe(5575426472);
    });
  });
});

class ProcesadorB2b {
  analizarPlanilla(path: string): Analisis {
    return {
      ordenes: [5575426472],
      unidades: [''],
      productos: [''],
    };
  }
}
