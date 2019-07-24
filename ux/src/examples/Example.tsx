import React, {useEffect, useState} from 'react';
import {SubscriptionClient} from 'subscriptions-transport-ws';
import {Button} from 'reactstrap';
import {request} from 'graphql-request';
import {Message, Scenario} from '../types';
import {castArray} from 'lodash';

const GRAPHQL_ENDPOINT = `http://0.0.0.0:4000/graphql`;
const SUBSCRIPTION_ENDPOINT = `ws://0.0.0.0:4000/graphql`;

const client = new SubscriptionClient(SUBSCRIPTION_ENDPOINT, {reconnect: true});

const Example: React.FC<{scenario: Scenario}> = ({scenario}) => {
  const [messages, setMessages] = useState<Message[]>([]);

  // subscribe/unsubscribe to channel
  useEffect(() => {
    const subscription = client.request({
      query: scenario.subscriptionQuery,
      variables: scenario.subscriptionVariables || {},
    }).subscribe({

      next: (result) => {
        const message = result.data[scenario.subscriptionName];
        // doing [message].concat(msgs) to reverse order
        setMessages(msgs => msgs.concat(castArray(message)));
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
      channel: scenario.channel,
      intervalMs: scenario.intervalMs,
    });
  }

  const handleStop = () => request(GRAPHQL_ENDPOINT, `
    mutation ($channel: String!) {
      destroyChannel(channel: $channel)
    }
  `, {channel: scenario.channel});

  const handleClear = () => setMessages([]);

  const messageEls = messages.map((msg) => (
    <div className="speech-bubble"><p>{msg.content}</p></div>));

  return (
    <React.Fragment>
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

export default Example;
