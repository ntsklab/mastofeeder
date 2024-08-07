import { ActivityPubMessage } from "./ActivityPubMessage";
import crypto from "crypto";
import { PRIVATE_KEY } from "./env";
import fetch from "node-fetch";
import { actorFetchAsync } from "./fetch-actor-info"

export const send = async <Message extends ActivityPubMessage<string, any>>(
  message: Message,
  toActor: string
) => {
  let actorInbox = await actorFetchAsync(toActor);
  if (actorInbox.inbox.length == 0) {
    throw new Error("actorFetchError in send function");
  }
  const { hostname, pathname } = new URL(actorInbox.inbox);

  const digestHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(message))
    .digest("base64");
  const signer = crypto.createSign("sha256");
  const d = new Date();
  const stringToSign = `(request-target): post ${pathname}\nhost: ${hostname}\ndate: ${d.toUTCString()}\ndigest: SHA-256=${digestHash}`;
  signer.update(stringToSign);
  signer.end();
  const signature = signer.sign(PRIVATE_KEY);
  const signature_b64 = signature.toString("base64");
  const keyId = `${message.actor}/#main-key`;
  let header = `keyId="${keyId}",headers="(request-target) host date digest",algorithm="rsa-sha256",signature="${signature_b64}"`;

  const req = await fetch(actorInbox.inbox, {
    headers: {
      Date: d.toUTCString(),
      Digest: `SHA-256=${digestHash}`,
      Signature: header,
      Accept: "application/activity+json"
    },
    method: "POST",
    body: JSON.stringify(message),
  });

  if (!req.ok) {
    throw new Error(
      `Failed to send message to ${actorInbox.inbox}: ${req.status} ${req.statusText} / sent message: ${message}`
    );
  }
};
