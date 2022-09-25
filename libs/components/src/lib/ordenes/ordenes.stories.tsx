import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Ordenes } from './ordenes';

export default {
  component: Ordenes,
  title: 'Ordenes',
} as ComponentMeta<typeof Ordenes>;

const Template: ComponentStory<typeof Ordenes> = (args) => (
  <Ordenes {...args} />
);

export const Primary = Template.bind({});
Primary.args = {};
