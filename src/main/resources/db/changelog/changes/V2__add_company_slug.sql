-- liquibase formatted sql

-- changeset leo-nardo:add-company-slug
ALTER TABLE company ADD COLUMN slug VARCHAR(255) UNIQUE;
