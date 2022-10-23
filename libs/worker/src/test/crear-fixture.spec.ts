import * as fs from 'fs';

import { ExcelLoader } from '../lib/xls-utils/ExcelLoader';
import { FixtureBuilder } from './XLSFixtureBuilder';

describe('crear planilla', () => {
  it('crear planilla con una línea', () => {
    const service = new FixtureBuilder();
    service.addLine(service.getTemplate());
    const path = service.save();
    const exists = fs.existsSync(path);
    expect(exists).toBe(true);
  });
  it('la plantilla tiene una lineas', () => {
    const service = new FixtureBuilder();
    service.addLine(service.getTemplate());
    const path = service.save();
    const lines = new ExcelLoader().load(path);
    expect(lines.length).toBe(1);
  });
  it('el código de producto es el mismo', () => {
    const service = new FixtureBuilder();
    service.addLine(service.getTemplate());
    const path = service.save();
    const lines = new ExcelLoader().load(path);
    expect(lines[0]['Cód. Cencosud']).toBe('1647753');
  });
  it('agrega linea con orden compra', () => {
    const service = new FixtureBuilder();
    service.addLine(service.getTemplate({ 'Número de Orden': 123 }));
    const path = service.save();
    const lines = new ExcelLoader().load(path);
    expect(lines[0]['Número de Orden']).toBe(123);
  });
  it('agrega dos lineas diferente orden', () => {
    const service = new FixtureBuilder();
    service.addLine(service.getTemplate({ 'Número de Orden': 123 }));
    service.addLine(service.getTemplate({ 'Número de Orden': 678 }));
    const path = service.save();
    const lines = new ExcelLoader().load(path);
    expect(lines[0]['Número de Orden']).toBe(123);
    expect(lines[1]['Número de Orden']).toBe(678);
  });
});
