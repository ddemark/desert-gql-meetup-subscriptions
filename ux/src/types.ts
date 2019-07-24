export interface Message {
  content: string;
}
export interface Scenario {
  label: string;
  key: string;
}

type Maybe<T> = T | null;
export type MaybeScenario = Maybe<Scenario>;
