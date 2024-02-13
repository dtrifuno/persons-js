import { TestApp } from './app';
import { TestGraphQLClient } from './graphql';
import { randomPerson } from './helpers';

describe('Person', () => {
  let app;
  let client;

  beforeEach(async () => {
    app = new TestApp();
    client = new TestGraphQLClient(app);
    await app.setUp();
    await app.listen();
  });

  afterEach(async () => {
    app.close();
    await app.tearDownDb();
  });

  describe('#person', () => {
    let person;

    beforeEach(async () => {
      person = randomPerson();
      await app.insertPersonInDb(person);
    });

    it('returns the correct record when given a valid id', async () => {
      const response = await client.person(person.id);
      expect(response).toMatchObject({ person });
    });

    it('returns null when no record matches the given id', async () => {
      const response = await client.person(
        'b1dc19af-912b-457f-ad37-726583f90441'
      );
      expect(response.person).toBeNull();
    });

    it('adds the record to the cache after retrieving it from the db', async () => {
      const validId = person.id;
      const fromDb = await client.person(validId);
      const fromCache = await client.person(validId);

      expect(await app.getPersonFromCache(validId)).toBeTruthy();
      expect(fromDb).toEqual(fromCache);
    });
  });

  describe('#createPerson', () => {
    let createPersonInput;

    beforeEach(async () => {
      const { id, modified, created, ...rest } = randomPerson();
      createPersonInput = rest;
    });

    it('returns a copy of the new record', async () => {
      const response = await client.createPerson(createPersonInput);
      expect(response.createPerson.person).toMatchObject(createPersonInput);
    });

    it('persists the record to the db', async () => {
      const response = await client.createPerson(createPersonInput);
      const { id } = response.createPerson.person;
      const dbResponse = JSON.parse(
        JSON.stringify(await app.getPersonFromDb(id))
      );
      expect(response.createPerson.person).toMatchObject(dbResponse);
    });
  });

  describe('#updatePerson', () => {
    let person;

    beforeEach(async () => {
      person = randomPerson();
      await app.insertPersonInDb(person);
    });

    it('returns a copy of the updated record', async () => {
      const updatePersonInput = { id: person.id, name: 'Newname' };
      const merged = { ...person, ...updatePersonInput };
      const { modified, created, ...expected } = merged;
      const response = await client.updatePerson(updatePersonInput);
      expect(response.updatePerson.person).toMatchObject(expected);
    });

    it('persists the updated record to the db', async () => {
      const updatePersonInput = { id: person.id, name: 'Newname' };
      const merged = { ...person, ...updatePersonInput };
      const { modified, created, ...expected } = merged;
      await client.updatePerson(updatePersonInput);
      const dbResponse = JSON.parse(
        JSON.stringify(await app.getPersonFromDb(person.id))
      );
      expect(dbResponse).toMatchObject(expected);
    });

    it('returns a null field when given an invalid id', async () => {
      const response = await client.updatePerson({
        id: 'b1dc19af-912b-457f-ad37-726583f90441',
        name: 'Nova',
      });
      expect(response.updatePerson.person).toBeNull();
    });

    it('updates the modified field to a later time', async () => {
      const response = await client.updatePerson({
        id: person.id,
        name: 'Nova',
      });
      const initialModified = new Date(person.modified);
      const responseModified = new Date(response.updatePerson.person.modified);
      expect(initialModified.getTime()).toBeLessThan(
        responseModified.getTime()
      );
    });

    it('invalidates cached copies of the record', async () => {
      await client.person(person.id); // warm cache
      await client.updatePerson({ id: person.id, name: 'Nova' });
      expect(await app.getPersonFromCache(person.id)).toBeFalsy();
    });
  });

  describe('#deletePerson', () => {
    let person;

    beforeEach(async () => {
      person = randomPerson();
      await app.insertPersonInDb(person);
    });

    it('removes the record from the db', async () => {
      await client.deletePerson({ id: person.id });
      expect(await app.getPersonFromDb(person.id)).toBeFalsy();
    });

    it('returns the final version of the record from the db', async () => {
      const response = await client.deletePerson({ id: person.id });
      expect(response.deletePerson.person).toMatchObject(person);
    });

    it('returns a null field when given an invalid id', async () => {
      const badId = 'b1dc19af-912b-457f-ad37-726583f90441';
      const response = await client.deletePerson({ id: badId });
      expect(response.deletePerson.person).toBeNull();
    });

    it('invalidates cached copies of the record', async () => {
      await client.person(person.id); // warm cache
      await client.deletePerson({ id: person.id });
      expect(await app.getPersonFromCache(person.id)).toBeFalsy();
    });
  });
});
