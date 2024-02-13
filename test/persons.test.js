import { TestApp } from './app';
import { TestGraphQLClient } from './graphql';
import { randomPerson } from './helpers';

const TOTAL_COUNT = 51;

describe('#persons', () => {
  let app;
  let client;
  let persons;

  beforeEach(async () => {
    app = new TestApp();
    client = new TestGraphQLClient(app);

    await app.setUp();
    persons = [...new Array(TOTAL_COUNT)].map(() => randomPerson());
    for (const person of persons) {
      await app.insertPersonInDb(person);
    }

    await app.listen();
  });

  afterEach(async () => {
    app.close();
    await app.tearDownDb();
  });

  it('allows the user to specify the page size', async () => {
    const response_3 = await client.persons(0, 3);
    const response_5 = await client.persons(0, 5);
    expect(response_3.persons.persons.length).toBe(3);
    expect(response_5.persons.persons.length).toBe(5);
  });

  it('returns the total number of records', async () => {
    const response = await client.persons(0, 1);
    expect(response.persons.totalCount).toBe(TOTAL_COUNT);
  });

  it('returns all records without duplicates between pages', async () => {
    let fetchedPersons = [];
    while (fetchedPersons.length < TOTAL_COUNT) {
      const response = await client.persons(fetchedPersons.length, 10);
      fetchedPersons = [...fetchedPersons, ...response.persons.persons];
    }
    expect(new Set(fetchedPersons.map((p) => p.email)).size).toBe(TOTAL_COUNT);
  });

  it('returns records sorted by email', async () => {
    const response = await client.persons(0, 100);
    const emails = response.persons.persons.map((p) => p.email);
    expect(emails).toStrictEqual([...emails].sort());
  });
});
