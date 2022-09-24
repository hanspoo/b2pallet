import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Productos } from './productos';

export default {
  component: Productos,
  title: 'Productos',
} as ComponentMeta<typeof Productos>;

const Template: ComponentStory<typeof Productos> = (args) => (
  <Productos {...args} />
);

export const Primary = Template.bind({});
Primary.args = {};
