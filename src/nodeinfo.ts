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
  metadata: {
    nodeName: string;
    nodeDescription: string;
  };
}

type wellknownNodeinfoResponse = {
  links:[{
    rel: string;
    href: string;
  }];
}

export const nodeinfoRoute: Route<Response.Ok<nodeinfoResponse>> = route
  .get("/nodeinfo/2.1")
  .handler(async (req) => {
    console.log("nodeinfo 2.1");
    return Response.ok({
      openRegistration: false,
      protocols: ["activitypub"],
      software: {
        name: "nt-mastofeeder",
        version: "0.2"
      },
      usage: {
        users: {
          total: "1"
        }
      },
      version: "2.1",
      metadata: {
        nodeName: "nt-Mastofeeder",
        nodeDescription: "Mastofeeder改造版\n\n自分用です"
      }
    });
  });

export const wellknownNodeinfoRoute: Route<Response.Ok<wellknownNodeinfoResponse>> = route
  .get("/.well-known/nodeinfo")
  .handler(async (req) => {
    console.log("well-known nodeinfo 2.1");
    return Response.ok({
      links: [
        {
          rel: "http://nodeinfo.diaspora.software/ns/schema/2.1",
          href: "https://mf.oyasumi.dev/nodeinfo/2.1"
        }
      ]
    });
  });
