import { router, route, Route, Response } from "typera-express";
import { followUnfollowRoute } from "./accept-follow-request";
import { usersRoute } from "./users";
import { webfingerRoute } from "./webfinger";
import { redirectToGithubRoute } from "./redirect-to-github-route";
import { redirectRoute } from "./redirect";

export const routes = router(
  redirectToGithubRoute,
  redirectRoute,
  webfingerRoute,
  usersRoute,
  followUnfollowRoute
).handler();
