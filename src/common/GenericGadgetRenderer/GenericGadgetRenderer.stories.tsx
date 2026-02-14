import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import GenericGadgetRenderer from './index';

export default {
  title: 'Common/GenericGadgetRenderer',
  component: GenericGadgetRenderer,
  parameters: {
    docs: {
      description: {
        component:
          'GenericGadgetRenderer handles the WebSocket connection to Inspector Gadget pods and manages data streaming. This component renders nothing visually but manages the gadget execution lifecycle.',
      },
    },
  },
} as Meta;

const Template: StoryFn<typeof GenericGadgetRenderer> = args => {
  const [bufferedData, setBufferedData] = React.useState({});
  const [gadgetData, setGadgetData] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3>GenericGadgetRenderer Status</h3>
        <p>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Pod Selected:</strong> {args.podSelected}
        </p>
        <p>
          <strong>Node:</strong> {args.node}
        </p>
        <p>
          <strong>Gadget Running:</strong> {args.gadgetRunningStatus ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Streams Connected:</strong> {args.podStreamsConnected}/{args.podsSelected.length}
        </p>
      </div>

      <GenericGadgetRenderer
        {...args}
        setBufferedGadgetData={setBufferedData}
        setGadgetData={setGadgetData}
        setLoading={setLoading}
      />

      <div style={{ marginTop: '20px' }}>
        <h4>Buffered Data:</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(bufferedData, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>Gadget Data:</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(gadgetData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export const TraceOpenGadget = Template.bind({});
TraceOpenGadget.args = {
  podsSelected: ['ig-pod-1', 'ig-pod-2'],
  podStreamsConnected: 2,
  podSelected: 'ig-pod-1',
  node: 'worker-node-1',
  imageName: 'ghcr.io/inspektor-gadget/trace_open',
  gadgetRunningStatus: true,
  dataColumns: {
    'worker-node-1': ['timestamp', 'pid', 'comm', 'fd', 'fname', 'err'],
  },
  filters: {
    '--output': 'columns',
    '--timeout': '30',
  },
  prepareGadgetInfo: (info: any) => console.log('Gadget info prepared:', info),
  setPodStreamsConnected: (count: any) => console.log('Pod streams connected:', count),
  setGadgetConfig: (config: any) => console.log('Gadget config set:', config),
};

export const WithGadgetInstance = Template.bind({});
WithGadgetInstance.args = {
  podsSelected: ['ig-pod-1'],
  podStreamsConnected: 1,
  podSelected: 'ig-pod-1',
  node: 'control-plane',
  imageName: 'ghcr.io/inspektor-gadget/trace_tcp',
  gadgetRunningStatus: true,
  gadgetInstance: {
    id: 'instance-123',
    gadgetConfig: {
      version: 1,
    },
  },
  dataColumns: {
    'control-plane': ['timestamp', 'pid', 'comm', 'ip', 'port', 'proto'],
  },
  filters: {},
  prepareGadgetInfo: (info: any) => console.log('Gadget info prepared:', info),
  setPodStreamsConnected: (count: any) => console.log('Pod streams connected:', count),
  setGadgetConfig: (config: any) => console.log('Gadget config set:', config),
};

export const NotRunning = Template.bind({});
NotRunning.args = {
  podsSelected: ['ig-pod-1'],
  podStreamsConnected: 1,
  podSelected: 'ig-pod-1',
  node: 'worker-node-2',
  imageName: 'ghcr.io/inspektor-gadget/profile_cpu',
  gadgetRunningStatus: false,
  dataColumns: {
    'worker-node-2': ['timestamp', 'pid', 'comm', 'cpu_usage'],
  },
  filters: {
    '--interval': '1s',
  },
  prepareGadgetInfo: (info: any) => console.log('Gadget info prepared:', info),
  setPodStreamsConnected: (count: any) => console.log('Pod streams connected:', count),
  setGadgetConfig: (config: any) => console.log('Gadget config set:', config),
};

export const MultiplePodsNotAllConnected = Template.bind({});
MultiplePodsNotAllConnected.args = {
  podsSelected: ['ig-pod-1', 'ig-pod-2', 'ig-pod-3'],
  podStreamsConnected: 2,
  podSelected: 'ig-pod-1',
  node: 'worker-node-1',
  imageName: 'ghcr.io/inspektor-gadget/snapshot_process',
  gadgetRunningStatus: true,
  dataColumns: {
    'worker-node-1': ['pid', 'ppid', 'comm', 'state'],
  },
  filters: {},
  prepareGadgetInfo: (info: any) => console.log('Gadget info prepared:', info),
  setPodStreamsConnected: (count: any) => console.log('Pod streams connected:', count),
  setGadgetConfig: (config: any) => console.log('Gadget config set:', config),
};
