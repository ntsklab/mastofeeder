import express from "express";
import bodyParser from "body-parser";
import { routes } from "./routes";
import { fetchAndSendAllFeeds } from "./fetch-and-send-all-feeds";
import { forever } from "./forever";
import { PORT } from "./env";

const app = express();

app.use(bodyParser.json({ type: "application/activity+json" }));

app.use(routes);

app.get("/", (req, res) => {
  res.redirect("https://github.com/ntsklab/mastofeeder");
});

app.get("/.well-known/host-meta", (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0"?>
<XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
<Link rel="lrdd" type="application/xrd+xml" template="https://mf.oyasumi.dev/.well-known/webfinger?resource={uri}" />
</XRD>`);
});

app.use("*", (req, res) => {
  console.log(req.baseUrl);
  console.dir(req.body, { depth: null });
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

forever(1000 * 60 * 10, fetchAndSendAllFeeds);
