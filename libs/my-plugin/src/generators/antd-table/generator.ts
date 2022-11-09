import { Tree } from '@nrwl/devkit';
import { AntdTableGeneratorSchema } from './schema';

export default async function (tree: Tree, options: AntdTableGeneratorSchema) {
  const data = tree.read(`${options.name}`);
  const s = data.toString('utf-8');
  const match = /(class|interface) (\w+)/.exec(s);
  if (!match) return;

  const fields = s.split('\n').filter((line) => /\w+\??: \w+.*?;/.test(line));
  const conTipos: Array<{ title: string; dataIndex: string; type: string }> =
    fields.map((line) => {
      const [name, type] = line.split(': ');
      return { title: name.trim(), dataIndex: name.trim(), type: type.trim() };
    });
  const clase = match[2];
  console.log(conTipos);

  console.log(`
  const columns = [
    ${conTipos
      .map(({ title, dataIndex, type }) => {
        const sorter = type.startsWith('number')
          ? `(a:${clase}, b:${clase}) => a.${dataIndex} - b.${dataIndex},`
          : `(a:${clase}, b:${clase}) => a.${dataIndex}.localeCompare(b.${dataIndex}),`;
        return `{ title: "${title}", dataIndex: "${dataIndex}",  sorter: ${sorter} }`;
      })
      .join(',\n')}
  ];  
  `);
}
