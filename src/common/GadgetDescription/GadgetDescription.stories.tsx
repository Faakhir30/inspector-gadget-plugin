import { Meta, StoryFn } from '@storybook/react';
import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GadgetContext } from '../GadgetContext';
import { GadgetDescription } from './index';

export default {
  title: 'Common/GadgetDescription',
  component: GadgetDescription,
  decorators: [
    Story => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Displays gadget instance details with editable name, embed configuration, and run mode settings.',
      },
    },
  },
} as Meta;

// Mock localStorage for stories
const mockLocalStorage = (() => {
  let store = {};

  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

// Override localStorage for stories
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

const Template: StoryFn<typeof GadgetDescription> = args => {
  const [embedView, setEmbedView] = useState('None');
  const [enableHistoricalData, setEnableHistoricalData] = useState(true);
  const [update] = useState(false);

  // Set up mock data in localStorage
  React.useEffect(() => {
    const instances = [
      {
        id: 'trace-open-123',
        name: 'My Trace Open Instance',
        kind: 'None',
        isHeadless: true,
      },
      {
        id: 'trace-tcp-456',
        name: 'TCP Tracer',
        kind: 'Pod',
        isHeadless: false,
        isEmbedded: true,
      },
    ];
    localStorage.setItem('headlamp_embeded_resources', JSON.stringify(instances));
  }, []);

  const gadgetContextValue = {
    gadgetRunningStatus: false,
    setGadgetRunningStatus: () => {},
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px' }}>
      <GadgetContext.Provider value={gadgetContextValue as any}>
        <GadgetDescription
          {...args}
          embedView={embedView}
          setEmbedView={setEmbedView}
          enableHistoricalData={enableHistoricalData}
          setEnableHistoricalData={setEnableHistoricalData}
          update={update}
        />
      </GadgetContext.Provider>
    </div>
  );
};

export const Default = Template.bind({});
Default.parameters = {
  reactRouter: {
    routePath: '/gadgets/:imageName/:id',
    routeParams: { imageName: 'trace_open', id: 'trace-open-123' },
  },
};

export const WithPodEmbed = Template.bind({});
WithPodEmbed.parameters = {
  reactRouter: {
    routePath: '/gadgets/:imageName/:id',
    routeParams: { imageName: 'trace_tcp', id: 'trace-tcp-456' },
  },
};

export const GadgetRunning: StoryFn<typeof GadgetDescription> = () => {
  const [embedView, setEmbedView] = useState('Node');
  const [enableHistoricalData, setEnableHistoricalData] = useState(true);

  React.useEffect(() => {
    const instances = [
      {
        id: 'running-gadget-789',
        name: 'Running CPU Profiler',
        kind: 'Node',
        isHeadless: true,
      },
    ];
    localStorage.setItem('headlamp_embeded_resources', JSON.stringify(instances));
  }, []);

  const gadgetContextValue = {
    gadgetRunningStatus: true,
    setGadgetRunningStatus: () => {},
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px' }}>
      <BrowserRouter>
        <GadgetContext.Provider value={gadgetContextValue as any}>
          <GadgetDescription
            embedView={embedView}
            setEmbedView={setEmbedView}
            enableHistoricalData={enableHistoricalData}
            setEnableHistoricalData={setEnableHistoricalData}
            update={false}
          />
        </GadgetContext.Provider>
      </BrowserRouter>
    </div>
  );
};
GadgetRunning.parameters = {
  reactRouter: {
    routePath: '/gadgets/:imageName/:id',
    routeParams: { imageName: 'profile_cpu', id: 'running-gadget-789' },
  },
};
