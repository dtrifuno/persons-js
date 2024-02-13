import { faker } from '@faker-js/faker';

const maybeGender = () =>
  faker.helpers.maybe(() => ({
    gender: faker.person.sex(),
  }));

const maybePhone = () =>
  faker.helpers.maybe(() => ({
    phone: faker.phone.number(),
  }));

const maybeBirthdate = () =>
  faker.helpers.maybe(() => ({
    birthdate: faker.date.birthdate().toISOString().split('T')[0],
  }));

export const randomPerson = () => ({
  id: faker.string.uuid(),
  name: faker.person.firstName(),
  surname: faker.person.lastName(),
  email: faker.internet.email(),
  ...maybeGender(),
  ...maybePhone(),
  ...maybeBirthdate(),
  created: new Date().toISOString(),
  modified: new Date().toISOString(),
});
