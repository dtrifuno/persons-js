CREATE TYPE genders AS ENUM ('male', 'female');
CREATE TABLE persons (
    id uuid NOT NULL,
    PRIMARY KEY (id),
    name varchar(256) NOT NULL,
    surname varchar(256) NOT NULL,
    email varchar(320) NOT NULL,
    phone varchar(32),
    gender genders,
    birthdate varchar(16),
    created timestamptz NOT NULL,
    modified timestamptz NOT NULL
);
CREATE INDEX idx_persons_email
ON persons (email);
