import { Meta, StoryFn } from '@storybook/react';
import React, { useState } from 'react';
import SelectFilter from './params/select';

export default {
  title: 'Gadgets/Params/SelectFilter',
  component: SelectFilter,
} as Meta;

const Template: StoryFn<typeof SelectFilter> = args => {
  const [value, setValue] = useState(args.param.possibleValues[0]);

  const config = {
    get: () => value,
    set: (newValue: string) => setValue(newValue),
  };

  return <SelectFilter {...args} config={config} />;
};

export const OutputFormat = Template.bind({});
OutputFormat.args = {
  param: {
    key: 'output',
    title: 'Output Format',
    description: 'Choose the output format for gadget results',
    possibleValues: ['json', 'yaml', 'columns', 'jsonpretty'],
  },
};

export const LogLevel = Template.bind({});
LogLevel.args = {
  param: {
    key: 'logLevel',
    title: 'Log Level',
    description: 'Set the logging verbosity level',
    possibleValues: ['debug', 'info', 'warn', 'error'],
  },
};

export const Protocol = Template.bind({});
Protocol.args = {
  param: {
    key: 'protocol',
    title: 'Network Protocol',
    description: 'Filter by network protocol type',
    possibleValues: ['tcp', 'udp', 'icmp', 'all'],
  },
};

export const SortBy = Template.bind({});
SortBy.args = {
  param: {
    key: 'sortBy',
    title: 'Sort By',
    possibleValues: ['name', 'timestamp', 'size', 'count'],
  },
};
