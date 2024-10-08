import SQL from "sql-template-strings";
import { Route, route, Response, Parser } from "typera-express";
import { urlParser } from "./url-parser";
import * as t from "io-ts";
import { fetchUrlInfo } from "./fetch-url-info";
import * as Option from "fp-ts/lib/Option";
import { openDb } from "./db";
import { v4 as uuid } from "uuid";
import { send } from "./send";
import { ActivityPubMessage } from "./ActivityPubMessage";
import { serverHostname } from "./env";

const activityStreamsContext = t.union([
  t.literal("https://www.w3.org/ns/activitystreams"),
  t.UnknownArray
]);

const followRequest = t.type({
  "@context": activityStreamsContext,
  id: t.string,
  type: t.literal("Follow"),
  actor: t.string, // Follower
  object: t.string, // To be followed
});
type FollowRequest = t.TypeOf<typeof followRequest>;

const unfollowRequest = t.type({
  "@context": activityStreamsContext,
  id: t.string,
  type: t.literal("Undo"),
  actor: t.string, // Follower
  object: t.type({
    // TODO: Should be inherited from FollowRequest
    id: t.string,
    type: t.literal("Follow"),
    actor: t.string, // Follower
    object: t.string, // To be followed
  }),
});
type UnfollowRequest = t.TypeOf<typeof unfollowRequest>;

const followOrUnfollowRequest = t.union([followRequest, unfollowRequest]);

const acceptActivity = (
  followedHostname: string,
  activityToAccept: ActivityPubMessage<any, any>
) =>
({
  "@context": "https://www.w3.org/ns/activitystreams",
  id: `https://${serverHostname}/${uuid()}`,
  //id: activityToAccept.id,
  type: "Accept",
  actor: `https://${serverHostname}/${encodeURIComponent(followedHostname)}`,
  object: activityToAccept,
} as const);

export const followUnfollowRoute: Route<
  Response.Ok | Response.BadRequest<string>
> = route
  .useParamConversions({ url: urlParser })
  .post("/:hostname(url)/inbox")
  .use(Parser.body(followOrUnfollowRequest))
  .handler(async (req) => {
    if (req.body.type === "Follow") {
      return handleFollowRequest(req.body, req.routeParams.hostname);
    }
    if (req.body.type === "Undo") {
      return handleUnfollowRequest(req.body, req.routeParams.hostname);
    }

    throw new Error("Unreachable");
  });

const handleFollowRequest = async (
  body: FollowRequest,
  followHostname: string
) => {
  const { actor: follower, object } = body;
  const id = `https://${serverHostname}/${encodeURIComponent(followHostname)}`;

  console.log(`handleFollowRequest -- follower: ${follower} followHostname: ${followHostname} object: ${object}`);
  
  if (object !== id)
    return Response.badRequest("Object does not match username");

  const info = await fetchUrlInfo(followHostname);
  if (Option.isNone(info) === null)
    return Response.badRequest("Domain does not have a feed");

  try {
    console.log("start handleFollowRequest");
    console.log("call acceptFollowRequest");
    await acceptFollowRequest(followHostname, follower);
    console.log("call informFollower");
    await informFollower(followHostname, follower, body);
    return Response.ok();
  } catch (e) {
    console.error(e);
    return Response.badRequest("Error following domain");
  }
};

const handleUnfollowRequest = async (
  body: UnfollowRequest,
  followHostname: string
) => {
  const { object: originalBody } = body;
  const { actor: follower, object } = originalBody;

  const id = `https://${serverHostname}/${encodeURIComponent(followHostname)}`;
  if (object !== id)
    return Response.badRequest("Object does not match username");

  try {
    await acceptUnfollowRequest(followHostname, follower);
    return Response.ok();
  } catch (e) {
    console.error(e);
    return Response.badRequest("Error unfollowing domain");
  }
};

const acceptFollowRequest = async (hostname: string, follower: string) => {
  const db = await openDb();
  await db.run(
    SQL`INSERT INTO followers (hostname, follower) VALUES (${hostname}, ${follower})`
  );
};

const acceptUnfollowRequest = async (hostname: string, follower: string) => {
  const db = await openDb();
  await db.run(
    SQL`DELETE FROM followers WHERE hostname = ${hostname} AND follower = ${follower}`
  );
};

const informFollower = async (
  followedHostname: string,
  follower: string,
  request: FollowRequest
) => {
  console.log(`informFollower -- followedHostname: ${followedHostname} follower: ${follower} request.actor: ${request.actor} request.id: ${request.id} request.object: ${request.object}`)
  const message = acceptActivity(followedHostname, request);
  await send(message, follower);
};
