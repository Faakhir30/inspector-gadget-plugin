import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import GadgetFilters from './gadgetFilters';

export default {
  title: 'Gadgets/GadgetFilters',
  component: GadgetFilters,
} as Meta;

const mockConfig = {
  params: [
    {
      key: 'output',
      title: 'Output Format',
      prefix: '--',
      typeHint: 'string',
      description: 'Output format: json, yaml, columns',
      defaultValue: 'columns',
      possibleValues: ['json', 'yaml', 'columns'],
    },
    {
      key: 'timeout',
      title: 'Timeout',
      prefix: '--',
      typeHint: 'number',
      description: 'Execution timeout in seconds',
      defaultValue: '30',
    },
    {
      key: 'follow',
      title: 'Follow Output',
      prefix: '--',
      typeHint: 'checkbox',
      description: 'Keep following the output stream',
      defaultValue: 'false',
    },
    {
      key: 'namespace',
      title: 'Namespace',
      prefix: '--',
      description: 'Kubernetes namespace to filter',
    },
    {
      key: 'verbose',
      title: 'Verbose Mode',
      prefix: '--',
      typeHint: 'checkbox',
      defaultValue: 'true',
    },
  ],
};

const Template: StoryFn<typeof GadgetFilters> = args => {
  const [filters, setFilters] = React.useState({});

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <GadgetFilters
        {...args}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={() => console.log('Applied filters:', filters)}
      />
      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <strong>Current Filters:</strong>
        <pre>{JSON.stringify(filters, null, 2)}</pre>
      </div>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  config: mockConfig,
  namespace: 'default',
  pod: 'example-pod',
};

export const WithoutNamespace = Template.bind({});
WithoutNamespace.args = {
  config: mockConfig,
};

export const MinimalConfig = Template.bind({});
MinimalConfig.args = {
  config: {
    params: [
      {
        key: 'output',
        title: 'Output',
        prefix: '--',
        possibleValues: ['json', 'yaml'],
      },
    ],
  },
};

export const ComplexFilters = Template.bind({});
ComplexFilters.args = {
  config: {
    params: [
      {
        key: 'protocol',
        title: 'Protocol',
        prefix: '--',
        typeHint: 'string',
        description: 'Network protocol to trace',
        possibleValues: ['tcp', 'udp', 'icmp'],
      },
      {
        key: 'port',
        title: 'Port',
        prefix: '--',
        typeHint: 'number',
        description: 'Port number to monitor',
        defaultValue: '8080',
      },
      {
        key: 'pid',
        title: 'Process ID',
        prefix: '--',
        typeHint: 'number',
        description: 'Filter by process ID',
      },
      {
        key: 'follow-forks',
        title: 'Follow Forks',
        prefix: '--',
        typeHint: 'checkbox',
        description: 'Follow process forks',
        defaultValue: 'true',
      },
      {
        key: 'container-name',
        title: 'Container Name',
        prefix: '--',
        description: 'Filter by container name',
      },
    ],
  },
  namespace: 'kube-system',
};
