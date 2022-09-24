import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Producto3d } from './Producto3d';

export default {
  component: Producto3d,
  title: 'Producto3d',
} as ComponentMeta<typeof Producto3d>;

const Template: ComponentStory<typeof Producto3d> = (args) => (
  <Producto3d {...args} />
);

export const Primary = Template.bind({});
Primary.args = {};
