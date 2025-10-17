-- Migration: 001-init.sql
-- Generated from specs/002-title-description-project/schema.prisma
-- Target: PostgreSQL
-- Notes:
-- 1) Requires uuid-ossp extension for uuid_generate_v4() or pgcrypto for gen_random_uuid().
--    Uncomment the extension you prefer.
-- 2) This migration is a dry-run SQL file; review before applying to any production DB.

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- alternative for gen_random_uuid()

-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
    CREATE TYPE role AS ENUM ('GENERAL_MEMBER','SHELTER_MEMBER','ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'species') THEN
    CREATE TYPE species AS ENUM ('CAT','DOG');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sex') THEN
    CREATE TYPE sex AS ENUM ('MALE','FEMALE','UNKNOWN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'animalstatus') THEN
    CREATE TYPE animalstatus AS ENUM ('DRAFT','SUBMITTED','PUBLISHED','RETIRED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'applicationtype') THEN
    CREATE TYPE applicationtype AS ENUM ('ADOPTION','REHOME');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'applicationstatus') THEN
    CREATE TYPE applicationstatus AS ENUM ('PENDING','UNDER_REVIEW','APPROVED','REJECTED','WITHDRAWN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medicalrecordtype') THEN
    CREATE TYPE medicalrecordtype AS ENUM ('TREATMENT','CHECKUP','VACCINE','SURGERY','OTHER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'externaldeliverystatus') THEN
    CREATE TYPE externaldeliverystatus AS ENUM ('NOT_APPLICABLE','PENDING','SENT','FAILED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jobstatus') THEN
    CREATE TYPE jobstatus AS ENUM ('PENDING','RUNNING','SUCCEEDED','FAILED');
  END IF;
END$$;

-- Table: users
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  username TEXT,
  phone_number TEXT,
  first_name TEXT,
  last_name TEXT,
  role role NOT NULL DEFAULT 'GENERAL_MEMBER',
  verified BOOLEAN NOT NULL DEFAULT false,
  primary_shelter_id UUID,
  profile_photo_url TEXT,
  settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Table: shelters
CREATE TABLE IF NOT EXISTS "Shelter" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  contact_email TEXT,
  contact_phone TEXT,
  address JSONB,
  verified BOOLEAN NOT NULL DEFAULT false,
  primary_account_user_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Table: animal
CREATE TABLE IF NOT EXISTS "Animal" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  species species NOT NULL,
  breed TEXT,
  sex sex NOT NULL,
  dob TIMESTAMPTZ,
  description TEXT,
  status animalstatus NOT NULL DEFAULT 'DRAFT',
  shelter_id UUID,
  owner_id UUID,
  medical_summary TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Table: animal_image
CREATE TABLE IF NOT EXISTS "AnimalImage" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL,
  storage_key TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  "order" INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_animal_image_animal FOREIGN KEY (animal_id) REFERENCES "Animal"(id) ON DELETE CASCADE
);

-- Table: application
CREATE TABLE IF NOT EXISTS "Application" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL,
  animal_id UUID NOT NULL,
  type applicationtype NOT NULL,
  status applicationstatus NOT NULL DEFAULT 'PENDING',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  assignee_id UUID,
  version INTEGER NOT NULL DEFAULT 1,
  idempotency_key TEXT,
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_application_applicant FOREIGN KEY (applicant_id) REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT fk_application_animal FOREIGN KEY (animal_id) REFERENCES "Animal"(id) ON DELETE CASCADE,
  CONSTRAINT fk_application_assignee FOREIGN KEY (assignee_id) REFERENCES "User"(id) ON DELETE SET NULL
);

-- Table: medical_record
CREATE TABLE IF NOT EXISTS "MedicalRecord" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL,
  record_type medicalrecordtype NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  provider TEXT,
  details TEXT,
  attachments JSONB,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_medicalrecord_animal FOREIGN KEY (animal_id) REFERENCES "Animal"(id) ON DELETE CASCADE,
  CONSTRAINT fk_medicalrecord_verifiedby FOREIGN KEY (verified_by) REFERENCES "User"(id) ON DELETE SET NULL,
  CONSTRAINT fk_medicalrecord_createdby FOREIGN KEY (created_by) REFERENCES "User"(id) ON DELETE RESTRICT
);

-- Table: attachment
CREATE TABLE IF NOT EXISTS "Attachment" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_type TEXT NOT NULL,
  owner_id UUID NOT NULL,
  storage_key TEXT NOT NULL,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_attachment_createdby FOREIGN KEY (created_by) REFERENCES "User"(id) ON DELETE RESTRICT
);

-- Table: notification
CREATE TABLE IF NOT EXISTS "Notification" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL,
  actor_id UUID,
  type TEXT NOT NULL,
  payload JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  external_delivery_status externaldeliverystatus NOT NULL DEFAULT 'NOT_APPLICABLE',
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id) REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_actor FOREIGN KEY (actor_id) REFERENCES "User"(id) ON DELETE SET NULL
);

-- Table: job
CREATE TABLE IF NOT EXISTS "Job" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  status jobstatus NOT NULL DEFAULT 'PENDING',
  payload JSONB,
  result_summary JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT fk_job_createdby FOREIGN KEY (created_by) REFERENCES "User"(id) ON DELETE SET NULL
);

-- Table: audit_log
CREATE TABLE IF NOT EXISTS "AuditLog" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  before JSONB,
  after JSONB,
  notes TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  shelter_id UUID,
  CONSTRAINT fk_auditlog_actor FOREIGN KEY (actor_id) REFERENCES "User"(id) ON DELETE SET NULL,
  CONSTRAINT fk_auditlog_shelter FOREIGN KEY (shelter_id) REFERENCES "Shelter"(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_application_applicant_status ON "Application" (applicant_id, status);
CREATE INDEX IF NOT EXISTS idx_application_animal ON "Application" (animal_id);
CREATE INDEX IF NOT EXISTS idx_medicalrecord_animal ON "MedicalRecord" (animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_shelter ON "Animal" (shelter_id);
CREATE INDEX IF NOT EXISTS idx_animal_owner ON "Animal" (owner_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipient_read ON "Notification" (recipient_id, read);
CREATE INDEX IF NOT EXISTS idx_auditlog_actor ON "AuditLog" (actor_id);

-- Foreign keys linking user.primary_shelter_id and shelter.primary_account_user_id
ALTER TABLE "User" ADD CONSTRAINT fk_user_primary_shelter FOREIGN KEY (primary_shelter_id) REFERENCES "Shelter"(id) ON DELETE SET NULL;
ALTER TABLE "Shelter" ADD CONSTRAINT fk_shelter_primary_account_user FOREIGN KEY (primary_account_user_id) REFERENCES "User"(id) ON DELETE SET NULL;

COMMIT;
