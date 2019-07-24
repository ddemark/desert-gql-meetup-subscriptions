import {Scenario} from './types';

export const GRAPHQL_ENDPOINT = `http://0.0.0.0:4000/graphql`;
export const SUBSCRIPTION_ENDPOINT = `ws://0.0.0.0:4000/graphql`;

export const CHANNELS = {
  prisma: `PRISMA`,
  pubsub: `PUBSUB`,
  pubsubFast: `PUBSUB_FAST`,
  pubsubBuffered: `PUBSUB_BUFFERED`,
};

export const SCENARIOS: Scenario[] = [
  {
    label: 'Prisma',
    key: CHANNELS.prisma,
  },
  {
    label: 'Pub Sub (Message received every second)',
    key: CHANNELS.pubsub,
  },
  {
    label: 'Pub Sub Fast (Many Messages w/o Throttle)',
    key: CHANNELS.pubsubFast,
  },
  {
    label: 'Pub Sub Buffered (Many Messages w/ Throttle)',
    key: CHANNELS.pubsubBuffered,
  },
];
