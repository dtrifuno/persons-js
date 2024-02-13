import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

const resolvers = {
  Query: {
    health_check: async () => true,
    person: async (_, { id }, { log, repo }) => {
      const person = await repo.findPersonById(id);
      if (person) {
        log.info(`Successfully retrieved person ${id}`);
      } else {
        log.info(`Failed to retrieve person ${id}`);
      }
      return person;
    },
    persons: async (_, { limit, offset }, { repo }) => {
      const paginatedPersons = await repo.findPersonsPaginated(limit, offset);
      return {
        persons: paginatedPersons,
      };
    },
  },
  Mutation: {
    createPerson: async (_, { input }, { log, repo }) => {
      const person = await repo.insertPerson({
        id: uuidv4(),
        ...input,
        created: new Date(),
        modified: new Date(),
      });
      log.info(`Successfully created person ${person.id}`);
      return { person };
    },
    updatePerson: async (_, { input }, { log, repo }) => {
      const person = await repo.updatePerson(input);
      if (person) {
        log.info(`Successfully updated person ${input.id}`);
      } else {
        log.info(`Failed to update person ${input.id}`);
      }
      return { person };
    },
    deletePerson: async (_, { input }, { log, repo }) => {
      const personId = input.id;
      const person = await repo.removePersonById(personId);
      if (person) {
        log.info(`Successfully deleted person ${personId}`);
      } else {
        log.info(
          `Attempted to delete person ${personId}, but no record was found`
        );
      }
      return { person };
    },
    addContact: async (_, { input }, { log, repo }) => {
      const { personId, contactId } = input;
      const success = repo.insertContact(personId, contactId);
      if (success) {
        const person = await repo.findPersonById(personId);
        const contact = await repo.findPersonById(contactId);
        if (person && contact) {
          log.info(`Successfully added contact ${contactId} to ${personId}`);
          return { person, contact };
        }
      }
      log.info(`Failed adding contact ${contactId} to ${personId}`);
      return { person: null, contact: null };
    },
    removeContact: async (_, { input }, { log, repo }) => {
      const { personId, contactId } = input;
      const success = await repo.removeContact(personId, contactId);
      if (success) {
        const person = await repo.findPersonById(personId);
        const contact = await repo.findPersonById(contactId);
        log.info(`Successfully removed contact ${contactId} from ${personId}`);
        return { person, contact };
      }
      return { person: null, contact: null };
    },
  },
  Page: {
    totalCount: async (_, args, { repo }) => await repo.getTotalPersonCount(),
  },
  Person: {
    age: ({ birthdate }) => {
      if (birthdate) {
        const diff = DateTime.now().diff(
          DateTime.fromJSDate(new Date(birthdate)),
          'years'
        );
        return Math.floor(diff.toObject().years);
      }
    },
    modified: ({ modified }) => modified.toISOString(),
    created: ({ created }) => created.toISOString(),
  },
};

export default resolvers;
