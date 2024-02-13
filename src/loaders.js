const loaders = {
  Person: {
    contacts: async (queries, { log, repo }) => {
      log.info('Executing contacts loader');
      const result = await repo.findContacts(queries.map(({ obj }) => obj.id));
      return result;
    },
  },
};

export default loaders;
