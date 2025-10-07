# Data Model: 貓狗領養平台 (MVP)

**Purpose**: Define primary entities, key fields, relationships, and validation rules derived from the spec.

## Entities

1. User
   - user_id: UUID
   - name: string (required)
   - email: string (required, unique)
   - role: enum (adopter, owner, admin) default: adopter
   - profile_completed: boolean
   - created_at, updated_at
   - Notes: authentication method: email/password + social login (NEEDS CLARIFICATION)

2. AnimalListing
   - listing_id: UUID
   - owner_id: UUID -> User.user_id
   - photos: array of image references (min 1)
   - species: string (cat/dog)
   - breed: string (optional)
   - age_estimate: string or integer
   - gender: enum (male, female, unknown)
   - health_status: text
   - vaccination_records: structured list
   - spayed_neutered: boolean
   - description: text
   - location: text (city/region)
   - status: enum (draft, pending, active, closed)
   - created_at, updated_at

3. AdoptionApplication
   - application_id: UUID
   - listing_id: UUID -> AnimalListing.listing_id
   - applicant_id: UUID -> User.user_id
   - answers: JSON / structured questionnaire
   - status: enum (submitted, under_review, approved, rejected)
   - submitted_at, reviewed_at, reviewer_id, review_notes

4. AuditLog
   - log_id: UUID
   - actor_id: UUID
   - action: string
   - target_type: string
   - target_id: UUID
   - timestamp
   - notes

5. SupportConversation
   - conversation_id: UUID
   - user_id: UUID
   - messages: array (author, text, timestamp, meta)
   - status: enum (open, pending_human, resolved)
   - created_at, resolved_at

## Relationships
- User (owner) 1:N AnimalListing
- AnimalListing 1:N AdoptionApplication
- User 1:N AdoptionApplication (applicant)

## Validation Rules
- AnimalListing must have at least one photo and a non-empty location.
- AdoptionApplication must include contact info and at least one answer to the questionnaire.
- AuditLog entries are immutable and must include actor_id and timestamp.

## Storage Recommendation (initial)
- Relational DB (PostgreSQL) recommended for transactional integrity (applications, approvals) and structured queries for filtering/searching listings. (Decision pending research)

## SQL Types, Constraints and Indexes (PostgreSQL)

### User
- user_id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- name: VARCHAR(200) NOT NULL
- email: VARCHAR(320) NOT NULL UNIQUE
- password_hash: VARCHAR(255) NULLABLE (for social-only accounts)
- role: VARCHAR(20) NOT NULL CHECK (role IN ('adopter','owner','admin')) DEFAULT 'adopter'
- profile_completed: BOOLEAN DEFAULT FALSE
- created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
- updated_at TIMESTAMP WITH TIME ZONE
- Indexes: UNIQUE(email), INDEX(role)

### AnimalListing
- listing_id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- owner_id: UUID REFERENCES users(user_id) ON DELETE CASCADE
- species: VARCHAR(50) NOT NULL
- breed: VARCHAR(100)
- age_estimate: INTEGER NULLABLE
- gender: VARCHAR(20) CHECK (gender IN ('male','female','unknown'))
- spayed_neutered: BOOLEAN DEFAULT FALSE
- description: TEXT
- location: VARCHAR(200) -- city/region
- status: VARCHAR(20) CHECK (status IN ('draft','pending','active','closed')) DEFAULT 'draft'
- created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
- updated_at TIMESTAMP WITH TIME ZONE
- Indexes: INDEX(species), INDEX(location), INDEX(status), FULLTEXT(description) (Postgres tsvector) for search

### AdoptionApplication
- application_id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- listing_id: UUID REFERENCES AnimalListing(listing_id) ON DELETE CASCADE
- applicant_id: UUID REFERENCES users(user_id) ON DELETE SET NULL
- answers: JSONB -- questionnaire
- status: VARCHAR(20) CHECK (status IN ('submitted','under_review','approved','rejected')) DEFAULT 'submitted'
- submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
- reviewed_at TIMESTAMP WITH TIME ZONE NULLABLE
- reviewer_id: UUID REFERENCES users(user_id) NULLABLE
- review_notes: TEXT
- Indexes: INDEX(status), INDEX(listing_id)

### AuditLog
- log_id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- actor_id: UUID REFERENCES users(user_id)
- action: VARCHAR(200)
- target_type: VARCHAR(100)
- target_id: UUID
- timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
- notes: TEXT
- Indexes: INDEX(actor_id), INDEX(target_type, target_id)

### SupportConversation
- conversation_id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID REFERENCES users(user_id)
- messages: JSONB
- status: VARCHAR(50) CHECK (status IN ('open','pending_human','resolved')) DEFAULT 'open'
- created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
- resolved_at TIMESTAMP WITH TIME ZONE NULLABLE

## State Transitions (examples)
- Listing: draft -> pending (when owner submits) -> active (when admin approves) -> closed (when adopted)
- Application: submitted -> under_review -> approved/rejected -> closed

## Prisma notes
- Prisma schema will mirror these types using `model` definitions with appropriate relations, enums, and JSON fields.

*** End Patch***
