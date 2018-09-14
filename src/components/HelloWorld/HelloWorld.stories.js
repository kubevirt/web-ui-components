import React from 'react';
import { storiesOf } from '@storybook/react';
import { HelloWorld } from '../index';

storiesOf('HelloWorld', module).add('with text', () => <HelloWorld />);
