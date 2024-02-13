import postgres from '@fastify/postgres';
import redis from '@fastify/redis';
import Fastify from 'fastify';
import mercurius from 'mercurius';
import mercuriusLogging from 'mercurius-logging';
import mercuriusValidation from 'mercurius-validation';

import loaders from './loaders';
import Repository from './repository';
import resolvers from './resolvers';
import schema from './schema';

export const createApp = (config) => {
  const app = Fastify({
    logger: {
      level: config.log_level,
    },
  });

  app.register(postgres, config.postgres);
  app.register(redis, config.redis);
  app.register(mercurius, {
    schema,
    resolvers,
    loaders,
    graphiql: config.env === 'development',
    context: (request) => ({
      log: request.log,
      repo: new Repository(app.pg, app.redis, request.log),
    }),
  });
  app.register(mercuriusValidation);
  app.register(mercuriusLogging);

  return app;
};
