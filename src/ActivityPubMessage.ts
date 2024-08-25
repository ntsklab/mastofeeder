export type ActivityPubMessage<T, O> = {
  "@context": "https://www.w3.org/ns/activitystreams" | readonly any[];
  id: string;
  type: T;
  actor: string;
  object: O;
};
