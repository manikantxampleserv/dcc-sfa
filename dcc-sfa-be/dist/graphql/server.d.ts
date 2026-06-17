import { ApolloServer } from 'apollo-server-express';
export interface MyContext {
    req: any;
    res: any;
}
export declare const createApolloServer: () => ApolloServer<MyContext>;
export declare const setupGraphQL: (app: any) => Promise<void>;
//# sourceMappingURL=server.d.ts.map