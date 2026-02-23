-- liquibase formatted sql

-- changeset leo-nardo:2
-- Comment: Add company_slug to company table
--preconditions onFail:MARK_RAN onError:HALT
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_name='company' AND column_name='slug'

ALTER TABLE company ADD COLUMN slug VARCHAR(255) UNIQUE;
