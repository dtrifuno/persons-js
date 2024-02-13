CREATE TABLE contacts (
  person_id uuid,
  contact_id uuid,
  PRIMARY KEY (person_id, contact_id),
  CONSTRAINT fk_person FOREIGN KEY(person_id) REFERENCES persons(id) ON DELETE CASCADE,
  CONSTRAINT fk_contact FOREIGN KEY(contact_id) REFERENCES persons(id) ON DELETE CASCADE
);
