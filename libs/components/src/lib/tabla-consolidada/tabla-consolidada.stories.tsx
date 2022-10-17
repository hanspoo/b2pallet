import { ComponentStory, ComponentMeta } from '@storybook/react';
import { TablaConsolidada } from './tabla-consolidada';

import { lineas } from './datos';

export default {
  component: TablaConsolidada,
  title: 'TablaConsolidada',
} as ComponentMeta<typeof TablaConsolidada>;

const Template: ComponentStory<typeof TablaConsolidada> = (args) => (
  <TablaConsolidada {...args} lineas={} />
);

export const Primary = Template.bind({});
Primary.args = { lineas };
