import { ComponentStory, ComponentMeta } from '@storybook/react';
import { SubirProductos } from './SubirProductos';

export default {
  component: SubirProductos,
  title: 'SubirProductos',
} as ComponentMeta<typeof SubirProductos>;

const Template: ComponentStory<typeof SubirProductos> = (args) => (
  <SubirProductos {...args} />
);

export const Primary = Template.bind({});
Primary.args = {};
