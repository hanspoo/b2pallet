import { capitalize } from 'lodash';
import { OrdenCompra } from '../lib/entity/orden-compra.entity';
import { dataSource } from '@flash-ws/dao';

beforeAll(async () => {
  await dataSource.initialize();
});
it('generar tabla ant', () => {
  const o: OrdenCompra = new OrdenCompra();
  const meta = dataSource.getMetadata(OrdenCompra);
  // console.log(meta.columns);
  const cols = meta.columns.map((c) =>
    col({
      entity: 'OrdenCompra',
      name: c.propertyName,
      type: c.type.toString(),
    })
  );

  console.log('[' + cols.join(',') + ']');
});

type Col = {
  entity: string;
  name: string;
  type: string;
};
function col(s: Col) {
  const title = capitalize(s.name);
  // console.log(s.type);

  const comparador =
    s.type.indexOf('Number') !== -1
      ? `a.${s.name} - b.${s.name}`
      : `a.${s.name}.localeCompare(b.${s.name})`;

  return `{ title: "${title}",  dataIndex: "${s.name}", sorter: (a: OrdenCompra, b: OrdenCompra) => {   return ${comparador}  } }`;
}
