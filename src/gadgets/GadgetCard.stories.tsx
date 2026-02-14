import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { GadgetCard } from './gadgetGrid';

export default {
  title: 'Gadgets/GadgetCard',
  component: GadgetCard,
} as Meta;

const Template: StoryFn<typeof GadgetCard> = args => (
  <div style={{ maxWidth: '400px', padding: '20px' }}>
    <GadgetCard {...args} />
  </div>
);

export const OfficialGadget = Template.bind({});
OfficialGadget.args = {
  gadget: {
    package_id: 'trace_open',
    display_name: 'trace open',
    description: 'Trace open system calls showing which files are being opened',
    version: '0.33.0',
    stars: 42,
    official: true,
    signed: true,
    cncf: true,
  },
  onEmbedClick: (gadget: any) => console.log('Embed clicked:', gadget),
};

export const CommunityGadget = Template.bind({});
CommunityGadget.args = {
  gadget: {
    package_id: 'trace_tcp',
    display_name: 'trace tcp',
    description: 'Trace TCP connections and monitor network activity in real-time',
    version: '0.32.1',
    stars: 28,
    official: false,
    signed: true,
    cncf: false,
  },
  onEmbedClick: (gadget: any) => console.log('Embed clicked:', gadget),
};

export const UnsignedGadget = Template.bind({});
UnsignedGadget.args = {
  gadget: {
    package_id: 'profile_cpu',
    display_name: 'profile cpu',
    description:
      'Profile CPU usage and generate flame graphs for performance analysis. This is a longer description to show how the card handles text overflow.',
    version: '0.30.0',
    stars: 15,
    official: false,
    signed: false,
    cncf: false,
  },
  onEmbedClick: (gadget: any) => console.log('Embed clicked:', gadget),
};

export const HighStarsGadget = Template.bind({});
HighStarsGadget.args = {
  gadget: {
    package_id: 'top_file',
    display_name: 'top file',
    description: 'Show top files by read/write operations',
    version: '0.33.1',
    stars: 156,
    official: true,
    signed: true,
    cncf: true,
  },
  onEmbedClick: (gadget: any) => console.log('Embed clicked:', gadget),
};

export const WithResourceContext = Template.bind({});
WithResourceContext.args = {
  gadget: {
    package_id: 'snapshot_process',
    display_name: 'snapshot process',
    description: 'Take a snapshot of running processes',
    version: '0.31.0',
    stars: 8,
    official: true,
    signed: true,
    cncf: false,
  },
  resource: {
    kind: 'Pod',
    metadata: { name: 'nginx-deployment-xyz' },
  },
  onEmbedClick: (gadget: any) => console.log('Embed clicked:', gadget),
};
