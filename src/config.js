import dotenv from 'dotenv';

dotenv.config();

export class Configuration {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';

    if (this.env === 'test') {
      this.log_level = 'fatal';
      this.server = {
        host: 'localhost',
        port: 0,
      };
    } else if (this.env === 'development') {
      this.log_level = process.env.LOG_LEVEL || 'trace';
      this.server = {
        host: 'localhost',
        port: Number(process.env.APP_PORT || 3000),
      };
    } else {
      this.log_level = process.env.LOG_LEVEL || 'info';
      this.server = {
        host: process.env.APP_HOST || '0.0.0.0',
        port: Number(process.env.APP_PORT || 3000),
      };
    }

    this.redis = {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6370),
      password: process.env.REDIS_PASSWORD || undefined,
    };

    this.postgres = {
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      port: Number(process.env.POSTGRES_PORT || 5432),
      database: process.env.POSTGRES_DB,
    };
  }

  get pgConnectionStringWithoutDb() {
    const { user, password, host, port } = this.postgres;
    return `postgres://${user}:${password}@${host}:${port}`;
  }

  get pgConnectionString() {
    const { database } = this.postgres;
    return `${this.pgConnectionStringWithoutDb}/${database}`;
  }

  get redisConnectionString() {
    const { host, port, password } = this.redis;
    if (password) {
      return `redis://:${password}@${host}:${port}`;
    }
    return `redis://${host}:${port}`;
  }
}
