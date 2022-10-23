import { ComponentStory, ComponentMeta } from '@storybook/react';
import { TablaConsolidada } from './tabla-consolidada';

import { lineas } from './datos';
import productosJSON from './productos.json';
import { Producto } from '@flash-ws/dao';
const productos = productosJSON as Producto[];

export default {
  component: TablaConsolidada,
  title: 'TablaConsolidada',
} as ComponentMeta<typeof TablaConsolidada>;

const Template: ComponentStory<typeof TablaConsolidada> = (args) => (
  <TablaConsolidada {...args} />
);

export const ConLineas = Template.bind({});
ConLineas.args = { lineas, productos };
export const SinLineas = Template.bind({});
SinLineas.args = { lineas: [], productos };
