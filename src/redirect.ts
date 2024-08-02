import { route, Route, Response } from "typera-express";
import { openDb } from "./db";
import SQL from "sql-template-strings";

export const redirectRoute: Route<Response.TemporaryRedirect> = route
  .get("/redirect")
  .handler((req) =>
    Response.temporaryRedirect(
      `<meta http-equiv='refresh' content='0; url='https://oyasumi.dev'>`,
      {
        location: `https://oyasumi.dev`,
      }
    )
  );
    /*
    const db = await openDb();
    const srcId = await db.get<{ id: string }>(
      SQL`select id from seen where id = ${req.query.url}`
    );
    if (srcId) {
      Response.temporaryRedirect(
        `<meta http-equiv='refresh' content='0; url='${srcId}'>`,
        {
          location: `${srcId}`
        }
      );
    }
    else {
      Response.temporaryRedirect(
        "<meta http-equiv='refresh' content='0; url='https://github.com/ntsklab/mastofeeder'>",
        {
          location: "https://github.com/ntsklab/mastofeeder"
        }
      );
    }
  });
*/