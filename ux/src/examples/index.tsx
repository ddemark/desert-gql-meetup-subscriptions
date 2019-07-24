import React from 'react';
import PrismaExample from './Prisma';
import PubSubExample from './PubSub';
import PubSubBufferedExample from './PubSubBuffered';
import PubSubFastExample from './PubSubFast';
import {MaybeScenario} from '../types';
import {CHANNELS} from '../scenarios';

const Examples: React.FC<{scenario: MaybeScenario}> = ({scenario}) => {
  if (!scenario) {
    return null;
  }

  switch (scenario.key) {
    case CHANNELS.prisma:
      return <PrismaExample />;
    case CHANNELS.pubsub:
      return <PubSubExample />;
    case CHANNELS.pubsubBuffered:
      return <PubSubBufferedExample />;
    case CHANNELS.pubsubFast:
      return <PubSubFastExample />;
    default: {
      console.error(`No example provided for ${scenario.key}, returning null`);
      return null;
    }
  }
}

export default Examples;
