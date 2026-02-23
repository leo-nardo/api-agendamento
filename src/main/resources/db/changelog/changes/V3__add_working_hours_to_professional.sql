-- liquibase formatted sql
-- changeset leo-nardo:3
-- Comment: Add working_hours to professional table
--preconditions onFail:MARK_RAN onError:HALT
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_name='professional' AND column_name='working_hours'

ALTER TABLE professional ADD COLUMN working_hours JSONB;
