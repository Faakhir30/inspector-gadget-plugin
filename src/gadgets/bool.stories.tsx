import { Meta, StoryFn } from '@storybook/react';
import React, { useState } from 'react';
import CheckboxFilter from './params/bool';

export default {
  title: 'Gadgets/Params/CheckboxFilter',
  component: CheckboxFilter,
} as Meta;

const Template: StoryFn<typeof CheckboxFilter> = args => {
  const [value, setValue] = useState('false');

  const config = {
    get: () => value,
    set: (newValue: string) => setValue(newValue),
  };

  return <CheckboxFilter {...args} config={config} />;
};

export const Default = Template.bind({});
Default.args = {
  param: {
    key: 'followSymlinks',
    title: 'Follow Symlinks',
    description: 'Follow symbolic links when traversing directories',
  },
};

export const WithoutDescription = Template.bind({});
WithoutDescription.args = {
  param: {
    key: 'verbose',
    title: 'Verbose Output',
  },
};

export const LongLabelDescription = Template.bind({});
LongLabelDescription.args = {
  param: {
    key: 'enableTracing',
    title: 'Enable Distributed Tracing',
    description:
      'Enable distributed tracing for this gadget instance to collect detailed execution traces across the cluster nodes',
  },
};
