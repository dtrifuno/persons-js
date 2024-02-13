import Cache from './cache';

export default class Repository {
  constructor(pg, redis, log) {
    this.pg = pg;
    this.log = log;
    this.cache = new Cache(redis, log);
  }

  async query(text, params) {
    const start = Date.now();
    const client = await this.pg.connect();
    try {
      const res = await client.query(text, params);
      const duration = Date.now() - start;
      this.log.debug({
        dbQuery: { text, duration, rows: res.rowCount },
      });
      return res;
    } finally {
      await client.release();
    }
  }

  async insertPerson(data) {
    const { rows } = await this.query(
      `
      INSERT INTO persons
        (id, name, surname, email, phone, gender, birthdate, modified, created)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id, name, surname, email, phone, gender, birthdate, modified, created
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
    return rows[0];
  }

  async getTotalPersonCount() {
    const { rows } = await this.query('SELECT COUNT(*) FROM persons');
    return rows[0].count;
  }

  async findPersonById(id) {
    const cachedResult = await this.cache.get(id);
    if (cachedResult) {
      return cachedResult;
    }

    const { rows } = await this.query(
      `
      SELECT
        id, name, surname, email, phone, gender, birthdate, modified, created
      FROM
        persons
      WHERE id = $1
      `,
      [id]
    );

    if (rows.length > 0) {
      const person = rows[0];
      this.cache.set(person);
      return person;
    }
  }

  async findPersonsPaginated(limit = 10, offset = 0) {
    const { rows } = await this.query(
      `
      SELECT
        id, name, surname, email, phone, gender, birthdate, modified, created
      FROM
        persons
      ORDER BY
        email ASC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }

  async removePersonById(id) {
    const { rows } = await this.query(
      `
      DELETE FROM
        persons
      WHERE
        id = $1
      RETURNING
        id, name, surname, email, phone, gender, birthdate, modified, created`,
      [id]
    );
    await this.cache.del(id);
    return rows[0];
  }

  async updatePerson(input) {
    const { id } = input;
    const person = await this.findPersonById(id);
    const newData = { ...person, ...input, modified: new Date() };
    const { rows } = await this.query(
      `
      UPDATE
        persons
      SET
        name = $1, surname = $2, email = $3, phone = $4, gender = $5, birthdate = $6, modified = $7
      WHERE
        id = $8
      RETURNING
        id, name, surname, email, phone, gender, birthdate, modified, created
      `,
      [
        newData.name,
        newData.surname,
        newData.email,
        newData.phone,
        newData.gender,
        newData.birthdate,
        newData.modified,
        newData.id,
      ]
    );

    if (rows.length > 0) {
      const person = rows[0];
      await this.cache.del(id);
      return person;
    }
  }

  async findContacts(personIds) {
    const { rows } = await this.query(
      `
      SELECT
        contacts.person_id, id, name, surname, email, phone, gender, birthdate, modified, created
      FROM
        contacts JOIN persons ON contacts.contact_id = persons.id
      WHERE
        contacts.person_id = ANY($1)
      `,
      [personIds]
    );
    const result = [...new Array(personIds.length)].map(() => []);
    for (const row of rows) {
      const { person_id, ...data } = row;
      result[personIds.findIndex((x) => x === person_id)].push(data);
    }
    return result;
  }

  async insertContact(personId, contactId) {
    try {
      const { rows } = await this.query(
        `
        INSERT INTO contacts (person_id, contact_id)
        VALUES ($1, $2)
        RETURNING person_id, contact_id
        `,
        [personId, contactId]
      );
      return rows.length > 0;
    } catch (e) {
      if (e.code === '23503') {
        this.log.info({
          dbQuery: {
            msg: 'Attempted to violate foreign key constraint',
            detail: e.detail
          }
        });
      }
    }
  }

  async removeContact(personId, contactId) {
    const { rows } = await this.query(
      `
      DELETE FROM contacts
      WHERE person_id = $1 AND contact_id = $2
      RETURNING person_id, contact_id
      `,
      [personId, contactId]
    );
    return rows.length > 0;
  }
}
