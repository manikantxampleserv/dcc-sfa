"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGraphQL = exports.createApolloServer = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const typeDefs_1 = require("./typeDefs");
const resolvers_1 = require("./resolvers");
const createApolloServer = () => {
    const server = new apollo_server_express_1.ApolloServer({
        typeDefs: typeDefs_1.typeDefs,
        resolvers: resolvers_1.resolvers,
        introspection: process.env.NODE_ENV !== 'production',
        context: ({ req, res }) => ({ req, res }),
    });
    return server;
};
exports.createApolloServer = createApolloServer;
const setupGraphQL = async (app) => {
    const server = (0, exports.createApolloServer)();
    await server.start();
    server.applyMiddleware({
        app,
        path: '/graphql',
    });
};
exports.setupGraphQL = setupGraphQL;
//# sourceMappingURL=server.js.map