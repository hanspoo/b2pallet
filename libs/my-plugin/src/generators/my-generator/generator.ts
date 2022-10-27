import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { MyGeneratorGeneratorSchema } from './schema';

interface NormalizedSchema extends MyGeneratorGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: MyGeneratorGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

export default async function (
  tree: Tree,
  options: MyGeneratorGeneratorSchema
) {
  const path = options.name;
  console.log(path);
  tree.children(path).forEach((fileName) => {
    const data = tree.read(`${path}/${fileName}`);
    const s = data.toString('utf-8');
    const match = /class (\w+)/.exec(s);
    if (!match) return;
    const className = match[1];
    const fields = s.split('\n').filter((line) => /\w+: \w+;/.test(line));
    const content = `
export interface ${className} {
  ${fields.join('\n')}
}    
    `;
    tree.write(`${path}/i${fileName}`, content);
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
