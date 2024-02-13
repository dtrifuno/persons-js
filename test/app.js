import { Redis } from 'ioredis';
import pg from 'pg';
import Postgrator from 'postgrator';
import { URL } from 'url';
import { v4 as uuidv4 } from 'uuid';

import { createApp } from '../src/app';
import { Configuration } from '../src/config';

export class TestApp {
  constructor() {
    this.config = new Configuration();
    this.config.postgres.database = 'test_db_' + uuidv4().replaceAll('-', '');
    this.app = null;
  }

  async listen() {
    if (!this.app) {
      throw new Error('Must run setUp() before starting app.');
    }
    await this.app.listen();
  }

  close() {
    this.app.close();
  }

  async setUp() {
    await this.createDb();
    await this.applyMigrations();
    this.app = createApp(this.config);
  }

  async createDb() {
    const { database } = this.config.postgres;
    const client = new pg.Client(this.config.pgConnectionStringWithoutDb);
    await client.connect();
    await client.query(`CREATE DATABASE ${database}`);
    await client.end();
  }

  async applyMigrations() {
    const client = new pg.Client(this.config.pgConnectionString);
    await client.connect();

    const __dirname = new URL('.', import.meta.url).pathname;
    const postgrator = new Postgrator({
      migrationPattern: __dirname + '../migrations/*.sql',
      driver: 'pg',
      database: this.config.postgres.database,
      schemaTable: 'schemaversion',
      execQuery: (query) => client.query(query),
    });
    await postgrator.migrate();

    await client.end();
  }

  async tearDownDb() {
    const client = new pg.Client(this.config.pgConnectionStringWithoutDb);
    await client.connect();
    await client.query(`DROP DATABASE ${this.config.postgres.database}`);
    await client.end();
  }

  async insertPersonInDb(data) {
    const client = new pg.Client(this.config.pgConnectionString);
    await client.connect();
    await client.query(
      `
      INSERT INTO persons
        (id, name, surname, email, phone, gender, birthdate, modified, created)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        data.id,
        data.name,
        data.surname,
        data.email,
        data.phone,
        data.gender,
        data.birthdate,
        data.modified,
        data.created,
      ]
    );
    await client.end();
  }

  async getPersonFromDb(id) {
    const client = new pg.Client(this.config.pgConnectionString);
    await client.connect();
    const { rows } = await client.query(
      `
      SELECT
        id, name, surname, email, phone, gender, birthdate, modified, created
      FROM 
        persons
      WHERE id = $1
      `,
      [id]
    );
    await client.end();
    return rows[0];
  }

  async getPersonFromCache(id) {
    const redis = new Redis(this.config.redisConnectionString);
    const cachedResult = await redis.get(`PERSON:${id}`);
    redis.disconnect();
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }
    return null;
  }

  async getContactFromDb(person_id, contact_id) {
    const client = new pg.Client(this.config.pgConnectionString);
    await client.connect();
    const { rows } = await client.query(
      `
      SELECT person_id, contact_id
      FROM contacts
      WHERE person_id = $1 AND contact_id = $2
      `,
      [person_id, contact_id]
    );
    await client.end();
    return rows[0];
  }

  async insertContactInDb(personId, contactId) {
    const client = new pg.Client(this.config.pgConnectionString);
    await client.connect();
    await client.query(
      'INSERT INTO contacts (person_id, contact_id) VALUES ($1, $2)',
      [personId, contactId]
    );
    await client.end();
  }
}
