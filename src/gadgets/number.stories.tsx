import { Meta, StoryFn } from '@storybook/react';
import React, { useState } from 'react';
import NumberFilter from './params/number';

export default {
  title: 'Gadgets/Params/NumberFilter',
  component: NumberFilter,
} as Meta;

const Template: StoryFn<typeof NumberFilter> = args => {
  const [value, setValue] = useState('');

  const config = {
    get: () => value,
    set: (_param: any, newValue: string) => setValue(newValue),
  };

  return <NumberFilter {...args} config={config} />;
};

export const Default = Template.bind({});
Default.args = {
  param: {
    key: 'timeout',
    title: 'Timeout',
    description: 'Timeout in seconds for the gadget execution',
    defaultValue: '30',
  },
};

export const WithoutDefaultValue = Template.bind({});
WithoutDefaultValue.args = {
  param: {
    key: 'limit',
    title: 'Result Limit',
    description: 'Maximum number of results to return',
  },
};

export const PortNumber = Template.bind({});
PortNumber.args = {
  param: {
    key: 'port',
    title: 'Port Number',
    description: 'The port number to monitor',
    defaultValue: '8080',
  },
};

export const BufferSize = Template.bind({});
BufferSize.args = {
  param: {
    key: 'bufferSize',
    title: 'Buffer Size (KB)',
    description: 'Size of the internal buffer in kilobytes',
    defaultValue: '1024',
  },
};
