import mercuriusValidation from 'mercurius-validation';

const schema = `
${mercuriusValidation.graphQLTypeDefs}

type Query {
    "Unconditionally returns true."
    health_check: Boolean!

    "Look up a person by their key."
    person(id: ID!): Person

    "Fetches a paginated list of people."
    persons(offset: Int!, limit: Int! @constraint(minimum: 1, maximum: 100)): Page!
}

type Mutation {
    "Creates a new person."
    createPerson(input: CreatePersonInput!): CreatePersonPayload!

    "Updates a person."
    updatePerson(input: UpdatePersonInput!): UpdatePersonPayload!

    "Deletes a person."
    deletePerson(input: DeletePersonInput!): DeletePersonPayload!

    "Adds a contact to a person's contact list."
    addContact(input: AddContactInput!): AddContactPayload!

    "Removes a contact from a person's contact list."
    removeContact(input: RemoveContactInput!): RemoveContactPayload!
}

enum Gender {
    male
    female
}

"""
Represents a person.
"""
type Person {
    "The object's Node ID."
    id: ID!

    "The person's first name."
    name: String!

    "The person's last name."
    surname: String!

    "The person's email."
    email: String!

    "The person's gender."
    gender: Gender

    "The person's phone number."
    phone: String

    "The person's date of birth in ISO 8601 format (YYYY-MM-DD)."
    birthdate: String

    "Returns the person's current age in years."
    age: Int

    "A list of the person's contacts."
    contacts: [Person!]!

    "Identifies the date and time when the object was created."
    created: String

    "Identifies the date and time when the object was last modified."
    modified: String
}

type Page {
    totalCount: Int!
    persons: [Person!]!
}

type CreatePersonPayload {
    person: Person
}

type UpdatePersonPayload {
    person: Person
}

type DeletePersonPayload {
    person: Person
}

type AddContactPayload {
    person: Person
    contact: Person
}

type RemoveContactPayload {
    person: Person
    contact: Person
}

input CreatePersonInput {
    name: String! @constraint(minLength: 1, maxLength: 256)
    surname: String! @constraint(minLength: 1, maxLength: 256)
    email: String! @constraint(format: "email", maxLength: 320)
    gender: Gender
    birthdate: String @constraint(format: "date")
    phone: String @constraint(maxLength: 32)
}

input UpdatePersonInput {
    id: ID!
    name: String @constraint(minLength: 1, maxLength: 256)
    surname: String @constraint(minLength: 1, maxLength: 256)
    email: String @constraint(format: "email", maxLength: 320)
    gender: Gender
    birthdate: String @constraint(format: "date")
    phone: String @constraint(maxLength: 32)
}

input DeletePersonInput {
    id: ID!
}

input AddContactInput {
    personId: ID!,
    contactId: ID!
}

input RemoveContactInput {
    personId: ID!,
    contactId: ID!
}
`;

export default schema;
