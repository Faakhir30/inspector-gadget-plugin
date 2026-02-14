import { Meta, StoryFn } from '@storybook/react';
import React, { useState } from 'react';
import { GadgetWithDataSource } from './index';

export default {
  title: 'Common/GadgetWithDataSource',
  component: GadgetWithDataSource,
  parameters: {
    docs: {
      description: {
        component:
          'Main component for displaying gadget data with filters, controls, and data visualization.',
      },
    },
  },
} as Meta;

const mockGadgetConfig = {
  params: [
    {
      key: 'output',
      title: 'Output Format',
      prefix: '--',
      description: 'Output format',
      possibleValues: ['columns', 'json', 'yaml'],
    },
    {
      key: 'timeout',
      title: 'Timeout',
      prefix: '--',
      typeHint: 'number',
      defaultValue: '30',
    },
  ],
};

const mockColumns = ['timestamp', 'pid', 'comm', 'fd', 'fname', 'err'];

const mockBufferedData = {
  'worker-node-1': [
    {
      timestamp: '2024-02-08T10:30:00Z',
      pid: 1234,
      comm: 'nginx',
      fd: 3,
      fname: '/var/log/nginx.log',
      err: 0,
    },
    {
      timestamp: '2024-02-08T10:30:01Z',
      pid: 1235,
      comm: 'postgres',
      fd: 5,
      fname: '/var/lib/postgresql/data',
      err: 0,
    },
    {
      timestamp: '2024-02-08T10:30:02Z',
      pid: 1236,
      comm: 'node',
      fd: 8,
      fname: '/app/server.js',
      err: 0,
    },
  ],
  'worker-node-2': [
    {
      timestamp: '2024-02-08T10:30:03Z',
      pid: 2234,
      comm: 'redis',
      fd: 4,
      fname: '/data/dump.rdb',
      err: 0,
    },
  ],
};

const Template: StoryFn<typeof GadgetWithDataSource> = args => {
  const [gadgetData, setGadgetData] = useState(mockBufferedData);
  const [bufferedGadgetData, setBufferedGadgetData] = useState(mockBufferedData);
  const [gadgetRunningStatus, setGadgetRunningStatus] = useState(false);
  const [filters, setFilters] = useState({ '--output': 'columns' });
  const [isRunningInBackground, setIsRunningInBackground] = useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <GadgetWithDataSource
        {...args}
        gadgetData={gadgetData}
        setGadgetData={setGadgetData}
        bufferedGadgetData={bufferedGadgetData}
        setBufferedGadgetData={setBufferedGadgetData}
        gadgetRunningStatus={gadgetRunningStatus}
        setGadgetRunningStatus={setGadgetRunningStatus}
        filters={filters}
        setFilters={setFilters}
        isRunningInBackground={isRunningInBackground}
        setIsRunningInBackground={setIsRunningInBackground}
      />
    </div>
  );
};

export const TraceOpenGadget = Template.bind({});
TraceOpenGadget.args = {
  podsSelected: ['ig-pod-1', 'ig-pod-2'],
  podStreamsConnected: 2,
  loading: false,
  gadgetConfig: mockGadgetConfig,
  dataSourceID: 'worker-node-1',
  columns: mockColumns,
  renderCreateBackgroundGadget: true,
  isInstantRun: false,
  error: null,
  headlessGadgetRunCallback: () => console.log('Headless gadget run'),
  headlessGadgetDeleteCallback: () => console.log('Headless gadget delete'),
  handleRun: () => console.log('Handle run'),
  onGadgetInstanceCreation: () => console.log('Gadget instance created'),
  gadgetConn: {},
};

export const GadgetRunning = Template.bind({});
GadgetRunning.args = {
  ...TraceOpenGadget.args,
  gadgetRunningStatus: true,
};

export const WithGadgetInstance = Template.bind({});
WithGadgetInstance.args = {
  ...TraceOpenGadget.args,
  gadgetInstance: {
    id: 'trace-open-instance-1',
    name: 'Background Trace Open',
    gadgetConfig: {
      version: 1,
      imageName: 'ghcr.io/inspektor-gadget/trace_open',
    },
  },
};

export const Loading = Template.bind({});
Loading.args = {
  ...TraceOpenGadget.args,
  loading: true,
  bufferedGadgetData: {},
};

export const WithError = Template.bind({});
WithError.args = {
  ...TraceOpenGadget.args,
  error: 'Failed to connect to gadget pod',
};

export const NotAllPodsConnected = Template.bind({});
NotAllPodsConnected.args = {
  ...TraceOpenGadget.args,
  podsSelected: ['ig-pod-1', 'ig-pod-2', 'ig-pod-3'],
  podStreamsConnected: 2,
};

export const InstantRunMode = Template.bind({});
InstantRunMode.args = {
  ...TraceOpenGadget.args,
  isInstantRun: true,
  renderCreateBackgroundGadget: false,
};

export const EmptyData = Template.bind({});
EmptyData.args = {
  ...TraceOpenGadget.args,
  bufferedGadgetData: {},
  gadgetData: {},
};
