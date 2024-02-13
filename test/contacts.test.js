import { TestApp } from './app';
import { TestGraphQLClient } from './graphql';
import { randomPerson } from './helpers';

describe('Contacts', () => {
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

  describe('#contacts', () => {
    let person;
    let contact1;
    let contact2;

    beforeEach(async () => {
      person = randomPerson();
      await app.insertPersonInDb(person);
      contact1 = randomPerson();
      await app.insertPersonInDb(contact1);
      contact2 = randomPerson();
      await app.insertPersonInDb(contact2);
      await app.insertContactInDb(person.id, contact1.id);
      await app.insertContactInDb(person.id, contact2.id);
    });

    it('returns a persons contacts', async () => {
      const response = await client.personContacts(person.id);
      const contactIds = response.person.contacts.map((c) => c.id);
      expect(contactIds).toHaveLength(2);
      expect(contactIds).toContain(contact1.id);
      expect(contactIds).toContain(contact2.id);
    });
  });

  describe('#addContact', () => {
    let person;
    let contact;

    beforeEach(async () => {
      person = randomPerson();
      await app.insertPersonInDb(person);
      contact = randomPerson();
      await app.insertPersonInDb(contact);
    });

    it('returns the person and their contact if sucessfully added', async () => {
      const response = await client.addContact({
        personId: person.id,
        contactId: contact.id,
      });
      expect(response.addContact.person).toMatchObject(person);
      expect(response.addContact.contact).toMatchObject(contact);
    });

    it('persists the record to the db', async () => {
      await client.addContact({
        personId: person.id,
        contactId: contact.id,
      });
      expect(await app.getContactFromDb(person.id, contact.id)).toBeTruthy();
    });

    it('returns null fields if either id is invalid', async () => {
      const badId = 'b1dc19af-912b-457f-ad37-726583f90441';
      const badPersonResponse = await client.addContact({
        personId: badId,
        contactId: contact.id,
      });
      const badContactResponse = await client.addContact({
        personId: person.id,
        contactId: badId,
      });
      expect(badPersonResponse.addContact.person).toBeNull();
      expect(badPersonResponse.addContact.contact).toBeNull();
      expect(badContactResponse.addContact.person).toBeNull();
      expect(badContactResponse.addContact.contact).toBeNull();
    });
  });

  describe('#removeContact', () => {
    let person;
    let contact;

    beforeEach(async () => {
      person = randomPerson();
      await app.insertPersonInDb(person);
      contact = randomPerson();
      await app.insertPersonInDb(contact);
      await app.insertContactInDb(person.id, contact.id);
    });

    it('returns the person and their contact if the contact existed', async () => {
      const response = await client.removeContact({
        personId: person.id,
        contactId: contact.id,
      });
      expect(response.removeContact.person).toMatchObject(person);
      expect(response.removeContact.contact).toMatchObject(contact);
    });

    it('removes the record from the db', async () => {
      await client.removeContact({
        personId: person.id,
        contactId: contact.id,
      });
      expect(await app.getContactFromDb(person.id, contact.id)).toBeFalsy();
    });

    it('returns null fields when the contact does not exist', async () => {
      const badId = 'b1dc19af-912b-457f-ad37-726583f90441';
      const response = await client.removeContact({
        personId: person.id,
        contactId: badId,
      });
      expect(response.removeContact.person).toBeNull();
      expect(response.removeContact.contact).toBeNull();
    });
  });
});
