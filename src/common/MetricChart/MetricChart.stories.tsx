import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { MetricChart } from './index';

export default {
  title: 'Common/MetricChart',
  component: MetricChart,
} as Meta;

const Template: StoryFn<typeof MetricChart> = args => <MetricChart {...args} />;

export const LatencyHistogram = Template.bind({});
LatencyHistogram.args = {
  node: 'worker-node-1',
  fields: [{ header: 'headlamp_value_latency' }, { header: 'headlamp_metric_unit_microseconds' }],
  data: {
    latency: [120, 45, 78, 234, 156, 89, 34, 12],
  },
};

export const BytesDistribution = Template.bind({});
BytesDistribution.args = {
  node: 'control-plane',
  fields: [{ header: 'headlamp_value_bytes' }, { header: 'headlamp_metric_unit_KB' }],
  data: {
    bytes: [1024, 2048, 512, 4096, 8192, 1536, 768, 256],
  },
};

export const RequestCount = Template.bind({});
RequestCount.args = {
  node: 'worker-node-2',
  fields: [{ header: 'headlamp_value_requests' }, { header: 'headlamp_metric_unit_count' }],
  data: {
    requests: [5, 12, 28, 45, 32, 18, 9, 3],
  },
};

export const EmptyData = Template.bind({});
EmptyData.args = {
  node: 'worker-node-3',
  fields: [{ header: 'headlamp_value_metric' }, { header: 'headlamp_metric_unit_ms' }],
  data: {
    metric: [],
  },
};

export const SingleDataPoint = Template.bind({});
SingleDataPoint.args = {
  node: 'master-node',
  fields: [{ header: 'headlamp_value_connections' }, { header: 'headlamp_metric_unit_count' }],
  data: {
    connections: [42],
  },
};
