import { ComponentStory, ComponentMeta } from '@storybook/react';
import { SubirOrdenes } from './SubirOrdenes';

export default {
  component: SubirOrdenes,
  title: 'SubirOrdenes',
} as ComponentMeta<typeof SubirOrdenes>;

process.env['NX_SERVER_URL'] = '';
const Template: ComponentStory<typeof SubirOrdenes> = (args) => (
  <SubirOrdenes />
);

export const Primary = Template.bind({});
Primary.args = {};
