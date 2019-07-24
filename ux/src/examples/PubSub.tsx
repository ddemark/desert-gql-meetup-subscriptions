import React, {useEffect, useState} from 'react';
import {SubscriptionClient} from 'subscriptions-transport-ws';
import {Button} from 'reactstrap';
import {request} from 'graphql-request';
import {Message} from '../types';
import {CHANNELS, GRAPHQL_ENDPOINT, SUBSCRIPTION_ENDPOINT} from '../scenarios';

const client = new SubscriptionClient(SUBSCRIPTION_ENDPOINT, {reconnect: true});

const PubSub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  // subscribe/unsubscribe to channel
  useEffect(() => {
    const subscription = client.request({
      query: `
      subscription($channel: String!) {
        pubsub(channel: $channel) {
          content
        }
      }
    `,
      variables: {
        channel: CHANNELS.pubsub,
      },
    }).subscribe({

      next: (result) => {
        const message = result.data.pubsub;
        setMessages(msgs => [message].concat(msgs));
      }
    });

    return function cleanup() {
      return subscription.unsubscribe();
    }
  });

  const handleStart = () =>  {
    return request(GRAPHQL_ENDPOINT, `
      mutation ($channel: String!, $intervalMs: Int!) {
        createChannel(channel: $channel, intervalMs: $intervalMs)
      }
    `, {
      channel: CHANNELS.pubsub,
      intervalMs: 1000,
    });
  }

  const handleStop = () => request(GRAPHQL_ENDPOINT, `
    mutation ($channel: String!) {
      destroyChannel(channel: $channel)
    }
  `, {channel: CHANNELS.pubsub});

  const handleClear = () => setMessages([]);

  const messageEls = messages.map((msg) => (
    <div className="speech-bubble"><p>{msg.content}</p></div>));

  return (
    <React.Fragment>
      <div className="section example-info">
        <p>
          To add messages, click "Create Channel". When done, click "Destroy Channel".
          Receives a message every second... that's about it...
        </p>
      </div>
      <div className="section example-info">
        <h6>Scenario:</h6>
        <Button color="primary" onClick={handleStart}>Create Channel</Button>
        <Button color="danger" onClick={handleStop}>Destroy Channel</Button>
      </div>

      <div className="section example-output">
        <h6>Messages:</h6>
        <Button onClick={handleClear}>Clear Messages</Button>
        <p>Messages (Count: {messages.length} results):</p>
        <div className="list">
          {messageEls}
        </div>
      </div>
    </React.Fragment>
  );
}

export default PubSub;
