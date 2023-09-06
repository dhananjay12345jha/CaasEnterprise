import { makeExecutableSchema } from "@graphql-tools/schema";
import * as express from "express";
import { graphqlHTTP } from "express-graphql";

import { resolvers, typeDefs } from "./graphql";

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app_url = process.env.MOCK_GRAPH_SERVER_URL || "http://localhost";
const app_path = process.env.MOCK_GRAPH_SERVER_PATH || "/graph";
const app_port = process.env.MOCK_GRAPH_SERVER_PORT || 8100;
const console_path = process.env.MOCK_GRAPH_CONSOLE_PATH || "/console";
const include_console = process.env.MOCK_GRAPH_CONSOLE || "true";

const app = express();
app.use(
  app_path,
  graphqlHTTP({
    schema,
  })
);

if (include_console.toLowerCase() == "true") {
  app.use(
    console_path,
    graphqlHTTP({
      schema,
      graphiql: true,
    })
  );
}

const url = new URL(app_url);
const server = app.listen(app_port, () => {
  console.info(
    `Listening on ${url.protocol}//${url.hostname}:${app_port}${app_path}`
  );
  if (include_console.toLowerCase() == "true") {
    console.info(
      `Access graphiql on ${url.protocol}//${url.hostname}:${app_port}${console_path}`
    );
  }
});

server.on("error", console.error);
