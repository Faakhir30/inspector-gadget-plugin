import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import Title from './params/title';

export default {
  title: 'Gadgets/Params/Title',
  component: Title,
  argTypes: {
    param: { control: 'object' },
  },
} as Meta;

const Template: StoryFn<typeof Title> = args => <Title {...args} />;

export const WithTitleOnly = Template.bind({});
WithTitleOnly.args = {
  param: {
    key: 'sampleParam',
    title: 'Sample Parameter',
  },
};

export const WithTitleAndDescription = Template.bind({});
WithTitleAndDescription.args = {
  param: {
    key: 'outputMode',
    title: 'Output Mode',
    description:
      'Specifies the output mode for the gadget execution. Choose between different formats.',
  },
};

export const WithLongDescription = Template.bind({});
WithLongDescription.args = {
  param: {
    key: 'filter',
    title: 'Filter Expression',
    description:
      'A complex filter expression that can be used to filter the output based on specific criteria. This description is intentionally long to demonstrate how the component handles overflow text with multiple lines. The component should truncate this at around 4 lines maximum.',
  },
};

export const KeyOnlyFallback = Template.bind({});
KeyOnlyFallback.args = {
  param: {
    key: 'myParameter',
  },
};
