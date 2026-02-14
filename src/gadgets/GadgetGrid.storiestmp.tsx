import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { GadgetGrid } from './gadgetGrid';

export default {
  title: 'Gadgets/GadgetGrid',
  component: GadgetGrid,
} as Meta;

const mockGadgets = [
  {
    package_id: 'trace_open',
    display_name: 'trace open',
    description: 'Trace open system calls',
    version: '0.33.0',
    stars: 42,
    official: true,
    signed: true,
    cncf: true,
  },
  {
    package_id: 'trace_tcp',
    display_name: 'trace tcp',
    description: 'Trace TCP connections',
    version: '0.32.1',
    stars: 28,
    official: false,
    signed: true,
    cncf: false,
  },
  {
    package_id: 'profile_cpu',
    display_name: 'profile cpu',
    description: 'Profile CPU usage',
    version: '0.30.0',
    stars: 15,
    official: true,
    signed: true,
    cncf: true,
  },
  {
    package_id: 'top_file',
    display_name: 'top file',
    description: 'Show top files by operations',
    version: '0.33.1',
    stars: 156,
    official: true,
    signed: true,
    cncf: true,
  },
  {
    package_id: 'snapshot_process',
    display_name: 'snapshot process',
    description: 'Snapshot running processes',
    version: '0.31.0',
    stars: 8,
    official: false,
    signed: false,
    cncf: false,
  },
  {
    package_id: 'trace_dns',
    display_name: 'trace dns',
    description: 'Trace DNS requests and responses',
    version: '0.32.0',
    stars: 35,
    official: true,
    signed: true,
    cncf: false,
  },
];

const Template: StoryFn<typeof GadgetGrid> = args => (
  <div style={{ padding: '20px' }}>
    <GadgetGrid {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  gadgets: mockGadgets,
  onEmbedClick: (gadget: any) => console.log('Embed clicked:', gadget),
  onAddGadget: (gadget: any) => console.log('Gadget added:', gadget),
};

export const WithResource = Template.bind({});
WithResource.args = {
  gadgets: mockGadgets,
  resource: {
    kind: 'Pod',
    jsonData: {
      metadata: { name: 'my-pod' },
      spec: { nodeName: 'node-1' },
    },
  },
  onEmbedClick: (gadget: any) => console.log('Embed clicked:', gadget),
  onAddGadget: (gadget: any) => console.log('Gadget added:', gadget),
};

export const FewGadgets = Template.bind({});
FewGadgets.args = {
  gadgets: mockGadgets.slice(0, 3),
  onEmbedClick: (gadget: any) => console.log('Embed clicked:', gadget),
  onAddGadget: (gadget: any) => console.log('Gadget added:', gadget),
};

export const EmptyGrid = Template.bind({});
EmptyGrid.args = {
  gadgets: [],
  onEmbedClick: (gadget: any) => console.log('Embed clicked:', gadget),
  onAddGadget: (gadget: any) => console.log('Gadget added:', gadget),
};

export const SingleGadget = Template.bind({});
SingleGadget.args = {
  gadgets: [mockGadgets[0]],
  onEmbedClick: (gadget: any) => console.log('Embed clicked:', gadget),
  onAddGadget: (gadget: any) => console.log('Gadget added:', gadget),
};
