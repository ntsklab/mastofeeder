import { route, Route, Response } from "typera-express";

type nodeinfoResponse = {
  openRegistration: boolean;
  protocols: string[];
  software: {
    name: string;
    version: string;
  };
  usage: {
    users: {
      total: string;
    };
  };
  version: string;
}
export const nodeinfoRoute: Route<Response.Ok<nodeinfoResponse>> = route
  .get("/nodeinfo/2.1")
  .handler(async (req) => {
    console.log("nodeinfo 2.1");
    return Response.ok({
      openRegistration: false,
      protocols: ["activitypub"],
      software: {
        name: "NT-Mastofeeder",
        version: "0.1"
      },
      usage: {
        users: {
          total: "1"
        }
      },
      version: "2.1"
    });
  });
