import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';

export interface MyContext {
  req: any;
  res: any;
}

export const createApolloServer = (): ApolloServer<MyContext> => {
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production',
    context: ({ req, res }: MyContext) => ({ req, res }),
  });

  return server;
};

export const setupGraphQL = async (app: any): Promise<void> => {
  const server = createApolloServer();

  await server.start();

  server.applyMiddleware({
    app,
    path: '/graphql',
  });
};
