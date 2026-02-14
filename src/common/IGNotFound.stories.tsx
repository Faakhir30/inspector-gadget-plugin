import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { IGNotFound } from './NotFound';

export default {
  title: 'Common/IGNotFound',
  component: IGNotFound,
} as Meta;

const Template: StoryFn<typeof IGNotFound> = () => <IGNotFound />;

export const Default = Template.bind({});
