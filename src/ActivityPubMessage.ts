export type ActivityPubMessage<T, O> = {
  //"@context": "https://www.w3.org/ns/activitystreams" | any[];
  "@context": string;
  id: string;
  type: T;
  actor: string;
  object: O;
};
