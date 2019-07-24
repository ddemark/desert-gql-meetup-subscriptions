import {ApolloServer, gql, PubSub} from 'apollo-server';
import {prisma, Message} from './generated/prisma-client';
import {Subject} from 'rxjs';
import {bufferTime} from 'rxjs/operators';

const channels = new PubSub();
const channelRegistry = {};
const BUFFER_TIME_IN_MS = 150;

// The GraphQL schema
const typeDefs = gql`
  type Message {
    id: ID!
    content: String!
    scenario: String!
  }

  type Query {
    messages: [Message!]!
  }

  type Mutation {
    addMessage(content: String!, scenario: String!): Message
    createChannel(channel: String!, intervalMs: Int!) : String
    destroyChannel(channel: String!): String
  }

  type Subscription {
    prisma: Message
    pubsub(channel: String!): Message
    pubsubBuffered(channel: String!): [Message!]!
  }
`;

const resolvers = {
  Query: {
    messages: () => []
  },
  Mutation: {
    addMessage: (parent: any, args: {content: string, scenario: string}) => {
      return prisma.createMessage({content: args.content, scenario: args.scenario});
    },
    createChannel: (parent: any, args: {channel: string, intervalMs: number}) => {
      if (channelRegistry[args.channel]) {
        throw new Error(`Channel Already Defined: ${args.channel}`)
      }
      let counter = 1;
      const {channel} = args;

      // ignore prisma
      if (channel === 'PRISMA') {
        return;
      }

      const isBuffered = channel === 'PUBSUB_BUFFERED';
      channelRegistry[channel] = setInterval(() => {
        const msg = {
          content: `Message ${counter++}`,
          scenario: isBuffered ? 'PubSubBuffered': 'PubSub',
        };
        console.log(`PUBLISHING!`, msg.content);

        if (isBuffered) {
          channels.publish(channel, {pubsubBuffered: msg});
        } else {
          channels.publish(channel, {pubsub: msg});
        }
      }, args.intervalMs);
      return channel;
    },
    destroyChannel: (parent: any, args: {channel: string}) => {
      if (!channelRegistry[args.channel]) {
        throw new Error(`Channel Not Defined: ${args.channel}`)
      }
      clearInterval(channelRegistry[args.channel]);
      delete channelRegistry[args.channel];
      return args.channel;
    },
  },
  Subscription: {
    prisma: {
      subscribe: (parent: unknown, args: any) => {
        return prisma.$subscribe.message({
          mutation_in: ['CREATED'],
          node: {
            scenario: 'prisma',
          },
        }).node().then((messageIterator) => {
          return {
            ...messageIterator,
            next: async (value?: any) => {
              const result = await messageIterator.next(value);
              return {
                done: result.done,
                value: {
                  prisma: result.value,
                },
              };
            }
          };
        });
      },
    },
    pubsub: {
      subscribe: (parent: unknown, args: {channel: string}) => {
        return channels.asyncIterator([args.channel]);
      }
    },
    pubsubBuffered: {
      subscribe: async (parent: unknown, args: {channel: string}) => {
        const {channel} = args;

        // create a new pubsub and use as an event emitter
        const pubsub = new PubSub();
        const pubSubIterator = pubsub.asyncIterator(channel);

        const subject = new Subject<{pubsubBuffered: Message}>();

        const subId = await channels.subscribe(channel, (msg) => subject.next(msg));

        subject
        .pipe(bufferTime(BUFFER_TIME_IN_MS))
        .subscribe(
          // next message handler
          results => {
            // this is an aggregation of multipl pubsubBuffered messages so clean up
            // and produce one result with many messages
            const messages: Message[] = results.map((o) => o.pubsubBuffered);

            // republish message using unique key
            if (results.length) {
              pubsub.publish(channel, {pubsubBuffered: messages});
            }
          },
          // error handler
          err => channels.unsubscribe(subId),
          // complete handler
          () => channels.unsubscribe(subId)
        )
        return {
          [Symbol.asyncIterator]: () => {
            return {
              ...pubSubIterator,
              next: async (value?: any) => pubSubIterator.next(value),
              return: async (value?: any) => {
                const result = await pubSubIterator.return(value);
                subject.complete();
                return result;
              }
            }
          }
        };
      }
    }
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen(80, '0.0.0.0').then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
