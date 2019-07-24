import React, {useEffect, useState} from 'react';
import {SubscriptionClient} from 'subscriptions-transport-ws';
import {Button} from 'reactstrap';
import {Message} from '../types';
import {SUBSCRIPTION_ENDPOINT} from '../scenarios';

const client = new SubscriptionClient(SUBSCRIPTION_ENDPOINT, {reconnect: true});

const Prisma: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  // subscribe/unsubscribe to channel
  useEffect(() => {
    const subscription = client.request({
      query: `
        subscription {
          prisma {
            content
          }
        }
    `,
    }).subscribe({
      next: (result) => {
        const message = result.data.prisma;
        setMessages(msgs => msgs.concat(message));
      }
    });

    // used named function for easier debugging
    return function cleanup() {
      return subscription.unsubscribe();
    }
  });

  const handleClear = () => setMessages([]);

  const messageEls = messages.map((msg) => (<div className="speech-bubble"><p>{msg.content}</p></div>));

  return (
    <React.Fragment>
      <div className="section example-info">
        <p>
          To add messages, go to the <a href="http://localhost:4000/graphql" target="_blank">GraphQL Playground</a>, (can also use prisma directly) and run:
        </p>
        <p>
          <code>
            {
              `mutation{
              addMessage(content: "Message Here", scenario: "Prisma"){
                id
                content
                scenario
              }
            }`
            }
          </code>
        </p>
      </div>

      <hr />

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

export default Prisma;
