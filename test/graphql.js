import { gql, GraphQLClient } from 'graphql-request';

export class TestGraphQLClient {
  constructor(app) {
    this.app = app;
  }

  get endpoint() {
    const host = this.app.config.server.host;
    const port = this.app.app.server.address().port;
    return `http://${host}:${port}/graphql`;
  }

  async request(document, variables) {
    const gqlClient = new GraphQLClient(this.endpoint);
    return await gqlClient.request(document, variables);
  }

  async health_check() {
    // TODO
  }

  async person(id) {
    return await this.request(
      gql`
        query getPerson($id: ID!) {
          person(id: $id) {
            id
            name
            surname
            email
            gender
            phone
            birthdate
            age
            created
            modified
          }
        }
      `,
      { id }
    );
  }

  async persons(offset, limit) {
    return await this.request(
      gql`
        query getPersons($offset: Int!, $limit: Int!) {
          persons(offset: $offset, limit: $limit) {
            totalCount
            persons {
              id
              name
              surname
              email
              gender
              phone
              birthdate
              age
              created
              modified
            }
          }
        }
      `,
      { offset, limit }
    );
  }

  async createPerson(input) {
    return await this.request(
      gql`
        mutation createPerson($input: CreatePersonInput!) {
          createPerson(input: $input) {
            person {
              id
              name
              surname
              email
              gender
              phone
              birthdate
              age
              created
              modified
            }
          }
        }
      `,
      { input }
    );
  }

  async deletePerson(input) {
    return await this.request(
      gql`
        mutation deletePerson($input: DeletePersonInput!) {
          deletePerson(input: $input) {
            person {
              id
              name
              surname
              email
              gender
              phone
              birthdate
              age
              created
              modified
            }
          }
        }
      `,
      { input }
    );
  }

  async updatePerson(input) {
    return await this.request(
      gql`
        mutation updatePerson($input: UpdatePersonInput!) {
          updatePerson(input: $input) {
            person {
              id
              name
              surname
              email
              gender
              phone
              birthdate
              age
              created
              modified
            }
          }
        }
      `,
      { input }
    );
  }

  async personContacts(id) {
    return await this.request(
      gql`
        query getPersonsContacts($id: ID!) {
          person(id: $id) {
            id
            contacts {
              id
              name
              surname
              email
              gender
              phone
              birthdate
              age
              created
              modified
            }
          }
        }
      `,
      { id }
    );
  }

  async addContact(input) {
    return await this.request(
      gql`
        mutation addContact($input: AddContactInput!) {
          addContact(input: $input) {
            person {
              id
              name
              surname
              email
              gender
              phone
              birthdate
              age
              created
              modified
            }
            contact {
              id
              name
              surname
              email
              gender
              phone
              birthdate
              age
              created
              modified
            }
          }
        }
      `,
      { input }
    );
  }

  async removeContact(input) {
    return await this.request(
      gql`
        mutation removeContact($input: RemoveContactInput!) {
          removeContact(input: $input) {
            person {
              id
              name
              surname
              email
              gender
              phone
              birthdate
              age
              created
              modified
            }
            contact {
              id
              name
              surname
              email
              gender
              phone
              birthdate
              age
              created
              modified
            }
          }
        }
      `,
      { input }
    );
  }
}
