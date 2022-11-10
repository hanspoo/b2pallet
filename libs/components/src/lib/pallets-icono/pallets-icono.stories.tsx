import { ComponentStory, ComponentMeta } from '@storybook/react';
import { PalletsIcono } from './pallets-icono';
import { palletsData } from './pallets-data';

export default {
  component: PalletsIcono,
  title: 'PalletsIcono',
} as ComponentMeta<typeof PalletsIcono>;

const Template: ComponentStory<typeof PalletsIcono> = (args) => (
  <PalletsIcono {...args} />
);

export const Primary = Template.bind({});
Primary.args = { pallets: palletsData };
