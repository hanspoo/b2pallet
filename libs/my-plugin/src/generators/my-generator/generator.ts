import { Tree, formatFiles, installPackagesTask } from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/workspace/generators';

interface MyGeneratorGeneratorSchema {
  name: string;
}

export default async function (
  tree: Tree,
  options: MyGeneratorGeneratorSchema
) {
  await libraryGenerator(tree, { name: 'interfaces' });
  await formatFiles(tree);

  const path = options.name;
  console.log(path);
  tree.children(path).forEach((fileName) => {
    const data = tree.read(`${path}/${fileName}`);
    const s = data.toString('utf-8');
    const match = /class (\w+)/.exec(s);
    if (!match) return;
    const className = match[1];
    // Juntamos todos los nombres de clases en los fields y les anteponemos I
    const fields = s.split('\n').filter((line) => /\w+\??: \w+.*?;/.test(line));
    const conTipos = fields.map((line) => {
      const [name, type] = line.split(': ');
      const typeFinal = /number|string|boolean/.test(type) ? type : `I${type}`;
      return `${name}: ${typeFinal}`;
    });
    const content = `
export interface I${className} {
  ${conTipos.join('\n')}
}    
    `;
    tree.write(`libs/interfaces/src/lib/i${fileName}`, content);
    return () => {
      installPackagesTask(tree);
    };
  });

  // const normalizedOptions = normalizeOptions(tree, options);
  // addProjectConfiguration(
  //   tree,
  //   normalizedOptions.projectName,
  //   {
  //     root: normalizedOptions.projectRoot,
  //     projectType: 'library',
  //     sourceRoot: `${normalizedOptions.projectRoot}/src`,
  //     targets: {
  //       build: {
  //         executor: "@flash-ws/my-plugin:build",
  //       },
  //     },
  //     tags: normalizedOptions.parsedTags,
  //   }
  // );
  // addFiles(tree, normalizedOptions);
  // await formatFiles(tree);
}
