# persons-js

This repository contains an example application providing a GraphQL API using Fastify and Mercurius.

## Usage

Running the application requires:

- Node
- Docker

It has been tested on Node v18.13.0 (LTS).

Run `docker compose up -d` to start the Postgres and Redis container, and then run `npm run migrate` to apply the database migrations.

Run `npm test` to execute the test suites, or `npm run dev` to start a dev server.

## Examples

### Create a person

```bash
curl 'http://localhost:3000/graphql' -X POST -H 'content-type: application/json' \
-d '{"query":"mutation {createPerson(input: {name: \"Jerry\", surname: \"Owens\", email: \"jowens@example.org\", birthdate: \"1997-07-20\"}) {person {id name surname email birthdate age modified created}}}"}' | jq
```

#### Output

```json
{
  "data": {
    "createPerson": {
      "person": {
        "id": "e340bce3-7b42-4de7-b821-3fcf5de41f70",
        "name": "Jerry",
        "surname": "Owens",
        "email": "jowens@example.org",
        "birthdate": "1997-07-20",
        "age": 26,
        "modified": "2024-02-19T07:13:12.196Z",
        "created": "2024-02-19T07:13:12.196Z"
      }
    }
  }
}
```

### Get a person's data

```bash
curl 'http://localhost:3000/graphql' -X POST -H 'content-type: application/json' \
-d '{"query":"{person(id: \"e340bce3-7b42-4de7-b821-3fcf5de41f70\") {id name surname email birthdate age modified created}}"}' | jq
```

#### Output

```json
{
  "data": {
    "person": {
      "id": "e340bce3-7b42-4de7-b821-3fcf5de41f70",
      "name": "Jerry",
      "surname": "Owens",
      "email": "jowens@example.org",
      "birthdate": "1997-07-20",
      "age": 26,
      "modified": "2024-02-19T07:13:12.196Z",
      "created": "2024-02-19T07:13:12.196Z"
    }
  }
}
```

### Modify a person

```bash
curl 'http://localhost:3000/graphql' -X POST -H 'content-type: application/json' \
-d '{"query":"mutation {updatePerson(input: {id: \"e340bce3-7b42-4de7-b821-3fcf5de41f70\" birthdate: \"1994-07-20\"}) {person {id name surname email birthdate age modified created}}}"}' | jq
```

#### Output

```json
{
  "data": {
    "updatePerson": {
      "person": {
        "id": "e340bce3-7b42-4de7-b821-3fcf5de41f70",
        "name": "Jerry",
        "surname": "Owens",
        "email": "jowens@example.org",
        "birthdate": "1994-07-20",
        "age": 29,
        "modified": "2024-02-19T07:17:31.279Z",
        "created": "2024-02-19T07:13:12.196Z"
      }
    }
  }
}
```

### Delete a person

```bash
curl 'http://localhost:3000/graphql' -X POST -H 'content-type: application/json' \
-d '{"query":"mutation {deletePerson(input: {id: \"e340bce3-7b42-4de7-b821-3fcf5de41f70\"}) {person {id name surname email modified created}}}"}' | jq
```

#### Output

```json
{
  "data": {
    "deletePerson": {
      "person": {
        "id": "e340bce3-7b42-4de7-b821-3fcf5de41f70",
        "name": "Jerry",
        "surname": "Owens",
        "email": "jowens@example.org",
        "modified": "2024-02-19T07:17:31.279Z",
        "created": "2024-02-19T07:13:12.196Z"
      }
    }
  }
}
```

### Get a paginated list of people

```bash
curl 'http://localhost:3000/graphql' -X POST -H 'content-type: application/json' \
-d '{"query":"{persons(offset: 0, limit: 5) {totalCount persons {id name email}}}"}' | jq
```

#### Output

```json
{
  "data": {
    "persons": {
      "totalCount": 6,
      "persons": [
        {
          "id": "0aea72cc-7a0d-4a23-8092-11751bb780b6",
          "name": "Evelyn",
          "email": "e.harber@gmail.com"
        },
        {
          "id": "6d4d9ea0-9bd3-4a7d-b5ab-140e965633d8",
          "name": "Jeremy",
          "email": "jhorne@gmail.com"
        },
        {
          "id": "5b02aca4-87a0-45cf-9c69-ba9df6cd6a57",
          "name": "Kacie",
          "email": "Kacie.Corkery@hotmail.com"
        },
        {
          "id": "5855cdb0-59a3-4c38-bb3c-3f32ba98c75c",
          "name": "Nathaniel",
          "email": "nburr@hotmail.com"
        },
        {
          "id": "166cd5be-ccd2-4e64-8d6d-3e919fd6fc2e",
          "name": "Joelle",
          "email": "roma54@yahoo.com"
        },
      ]
    }
  }
}
```

### Add a contact

```bash
curl 'http://localhost:3000/graphql' -X POST -H 'content-type: application/json' \
-d '{"query":"mutation {addContact(input: {personId: \"5b02aca4-87a0-45cf-9c69-ba9df6cd6a57\", contactId: \"166cd5be-ccd2-4e64-8d6d-3e919fd6fc2e\"}) {person {id name email} contact {id name email}}}"}' | jq
```

#### Output

```json
{
  "data": {
    "addContact": {
      "person": {
        "id": "5b02aca4-87a0-45cf-9c69-ba9df6cd6a57",
        "name": "Kacie",
        "email": "Kacie.Corkery@hotmail.com"
      },
      "contact": {
        "id": "166cd5be-ccd2-4e64-8d6d-3e919fd6fc2e",
        "name": "Joelle",
        "email": "Roma54@yahoo.com"
      }
    }
  }
}
```

### View a person's contacts

```bash
curl 'http://localhost:3000/graphql' -X POST -H 'content-type: application/json' \
-d '{"query":"{person(id: \"5b02aca4-87a0-45cf-9c69-ba9df6cd6a57\") {id name email contacts {id name email}}}"}' | jq
```

#### Output

```json
{
  "data": {
    "person": {
      "id": "5b02aca4-87a0-45cf-9c69-ba9df6cd6a57",
      "name": "Kacie",
      "email": "Kacie.Corkery@hotmail.com",
      "contacts": []
    }
  }
}
```

### Remove a contact

```bash
curl 'http://localhost:3000/graphql' -X POST -H 'content-type: application/json' \
-d '{"query":"mutation {removeContact(input: {personId: \"5b02aca4-87a0-45cf-9c69-ba9df6cd6a57\", contactId: \"166cd5be-ccd2-4e64-8d6d-3e919fd6fc2e\"}) {person {id name email} contact {id name email}}}"}' | jq
```

#### Output

```json
{
  "data": {
    "removeContact": {
      "person": {
        "id": "5b02aca4-87a0-45cf-9c69-ba9df6cd6a57",
        "name": "Kacie",
        "email": "Kacie.Corkery@hotmail.com"
      },
      "contact": {
        "id": "166cd5be-ccd2-4e64-8d6d-3e919fd6fc2e",
        "name": "Joelle",
        "email": "Roma54@yahoo.com"
      }
    }
  }
}
```
