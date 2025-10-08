# ERD（Entity Relationship Diagram）— 貓狗領養平台

此檔案提供：
- 主要資料表（實體）與欄位摘要
- 關聯（FK）與基數（cardinality）說明
- Mermaid 與 PlantUML 原始碼（可在支援的渲染器中預覽）

注意：此 ERD 以 MVP 為導向，側重於：User、Animal、Application、MedicalRecord、Image 與 AuditLog。請視需求延伸索引、分區或監控表（如 Notification、Jobs）。

---

## 實體摘要（重要欄位）
- User (id PK, username, email, passwordHash, role, verifiedEmail, createdAt, updatedAt)
- Shelter (id PK, name, contactInfo, createdAt, updatedAt)
- Animal (id PK, ownerId FK -> User.id, shelterId FK -> Shelter.id, name, species, breed, sex, ageMonths, description, status, location, createdAt, updatedAt, deletedAt)
- Image (id PK, ownerType, ownerId, url, altText, createdAt)
- Application (id PK, type, animalId FK -> Animal.id, applicantId FK -> User.id, answers JSON, status, submittedAt, reviewedAt)
- MedicalRecord (id PK, animalId FK -> Animal.id, recordType, date, provider, details, attachments JSON, verified, verifiedBy FK -> User.id, createdBy FK -> User.id)
- AuditLog (id PK, actorId FK -> User.id, action, targetType, targetId, before JSON, after JSON, timestamp)
- Conversation / Message (conversationId PK, participants[], Message: id PK, conversationId FK, senderId FK -> User.id, content, createdAt)

---

## Cardinalities（簡要）
- User 1 --- N Animal (as owner)
- Shelter 1 --- N Animal
- Animal 1 --- N Image
- Animal 1 --- N Application
- User 1 --- N Application (as applicant)
- Animal 1 --- N MedicalRecord
- User 1 --- N MedicalRecord (createdBy or verifiedBy)
- Any entity (Animal/Application/MedicalRecord) 可有多個 Image 附件（Image.ownerType + ownerId）

---

## Mermaid ER Diagram（erDiagram）

```mermaid
erDiagram
    USER {
        string id PK
        string username
        string email
        string passwordHash
        string role
        boolean verifiedEmail
        datetime createdAt
        datetime updatedAt
    }

    SHELTER {
        string id PK
        string name
        json contactInfo
        datetime createdAt
        datetime updatedAt
    }

    ANIMAL {
        string id PK
        string ownerId FK
        string shelterId FK
        string name
        string species
        string breed
        string sex
        int ageMonths
        string description
        string status
        json location
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    IMAGE {
        string id PK
        string ownerType
        string ownerId
        string url
        string altText
        datetime createdAt
    }

    APPLICATION {
        string id PK
        string type
        string animalId FK
        string applicantId FK
        json answers
        string status
        datetime submittedAt
        datetime reviewedAt
    }

    MEDICAL_RECORD {
        string id PK
        string animalId FK
        string recordType
        date date
        string provider
        string details
        json attachments
        boolean verified
        string verifiedBy FK
        string createdBy FK
        datetime createdAt
    }

    AUDIT_LOG {
        string id PK
        string actorId FK
        string action
        string targetType
        string targetId
        json before
        json after
        datetime timestamp
    }

    USER ||--o{ ANIMAL : owns
    SHELTER ||--o{ ANIMAL : houses
    ANIMAL ||--o{ IMAGE : has
    ANIMAL ||--o{ APPLICATION : has
    USER ||--o{ APPLICATION : applies
    ANIMAL ||--o{ MEDICAL_RECORD : has
    USER ||--o{ MEDICAL_RECORD : creates
    USER ||--o{ AUDIT_LOG : performs
    ANIMAL ||--o{ IMAGE : "attachments"
```

---

## PlantUML ER Diagram（可用 PlantUML 或 IDE 外掛渲染）

```plantuml
@startuml
' Entities
entity "User" as U {
  * id : UUID
  --
  username
  email
  password_hash
  role
  verified_email
  created_at
  updated_at
}

entity "Shelter" as S {
  * id : UUID
  --
  name
  contact_info
  created_at
  updated_at
}

entity "Animal" as A {
  * id : UUID
  --
  owner_id
  shelter_id
  name
  species
  breed
  sex
  age_months
  description
  status
  location
  created_at
  updated_at
  deleted_at
}

entity "Image" as I {
  * id : UUID
  --
  owner_type
  owner_id
  url
  alt_text
  created_at
}

entity "Application" as App {
  * id : UUID
  --
  type
  animal_id
  applicant_id
  answers
  status
  submitted_at
  reviewed_at
}

entity "MedicalRecord" as MR {
  * id : UUID
  --
  animal_id
  record_type
  date
  provider
  details
  attachments
  verified
  verified_by
  created_by
  created_at
}

entity "AuditLog" as AL {
  * id : UUID
  --
  actor_id
  action
  target_type
  target_id
  before
  after
  timestamp
}

' Relationships
U ||--o{ A : owns
S ||--o{ A : houses
A ||--o{ I : has
A ||--o{ App : has
U ||--o{ App : applies
A ||--o{ MR : has
U ||--o{ MR : creates
U ||--o{ AL : performs

' Composite/attachment relationship
A ||--o{ I : attachments

@enduml
```

---

## 建議與下一步
- 若需要，我可以：
  - 將上述 PlantUML/Mermaid 轉成 SVG/PNG 並放到 `specs/002-title-description-project/assets/`。
  - 直接根據 ERD 產生完整 `schema.prisma`（包含索引與 foreign key 約束）。
  - 產生 SQL migration 模板（Postgres）與初始 migration 指令。

告訴我你想要哪一個，我會接著把圖檔或 migration 加到分支 `002-title-description-project`。