const defaultPort = 4000;

interface Environment {
    apollo: {
        introspection: boolean,
        playground: boolean
    },
    port: number|string;
    jwt_key: string | any;
    expire_token: string | undefined;
}

export const environment: Environment = {
    apollo: {
        introspection: process.env.APOLLO_INTROSPECTION === 'true',
        playground: process.env.APOLLO_PLAYGROUND === 'true'
    },
    port: process.env.PORT || defaultPort,
    jwt_key: process.env.JWT_KEY,
    expire_token: process.env.EXPIRE_TOKEN,
};