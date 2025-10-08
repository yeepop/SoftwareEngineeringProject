# Data Model: 貓狗領養平台 (MVP)

**目的**：此檔案定義主要實體（Entities）、關聯、欄位型別、約束條件、狀態轉換與實作範例（Prisma schema 摘要與 DTO），供後端開發、資料庫建模與 QA 使用。

設計原則：
- 以資料一致性與審計可追溯為優先（關鍵操作寫入 AuditLog）。
- 支援圖片/附件之外部物件儲存（S3 等），資料庫僅儲存引用 URL/Key。
- 使用 enum 與 JSONB（或等價類型）保存可變表單資料（questionnaire/answers）。

---

## 主要實體（Entities）

1) User
- id: UUID (PK)
- username: string (required, unique)
- email: string (required, unique)
- password_hash: string | null
- role: enum { MEMBER, OWNER, SHELTER, ADMIN } default MEMBER
- firstName: string | null
- lastName: string | null
- phoneNumber: string | null
- verifiedEmail: boolean default false
- createdAt, updatedAt: timestamp
- disabled: boolean default false
- notes: profileCompleted boolean 可以由行為推估或明確欄位

用途：代表領養者、送養者（飼主、收容所）、與管理員。

2) Shelter
- id: UUID (PK)
- name: string
- contactInfo: JSON (address, phone, email)
- createdAt, updatedAt

3) Animal (或 AnimalListing)
- id: UUID (PK)
- ownerId: UUID -> User.id (nullable if shelter-owned use shelterId)
- shelterId: UUID -> Shelter.id (nullable)
- name: string | null
- species: enum { DOG, CAT }
- breed: string | null
- sex: enum { MALE, FEMALE, UNKNOWN }
- ageMonths: int | null (use整數月以便篩選)
- approximateAge: string | null
- description: text
- status: enum { DRAFT, SUBMITTED, PUBLISHED, RETIRED } default DRAFT
- images: json[] or separate Image table (建議使用 Image table)
- location: {city, region, lat?, lng?} （JSON or normalized欄位）
- spayedNeutered: boolean | null
- createdAt, updatedAt
- deletedAt: timestamp | null (soft delete)

4) Image (可為獨立 table)
- id: UUID
- ownerType: enum { ANIMAL, APPLICATION, USER, MEDICAL_RECORD }
- ownerId: UUID
- url: string
- altText: string | null
- createdAt

5) Application (Adoption / Rehome)
- id: UUID
- type: enum { ADOPTION, REHOME }
- animalId: UUID -> Animal.id
- applicantId: UUID -> User.id
- ownerId: UUID -> User.id (the animal owner at time of submission; nullable)
- answers: JSONB (問題與回覆)
- status: enum { PENDING, UNDER_REVIEW, APPROVED, REJECTED, WITHDRAWN, CLOSED }
- submittedAt, reviewedAt, closedAt
- reviewNotes: text | null
- assigneeId: UUID | null (管理員或 owner 處理者)
- createdAt, updatedAt

6) MedicalRecord
- id: UUID
- animalId: UUID -> Animal.id
- recordType: enum { TREATMENT, CHECKUP, VACCINE }
- date: date
- provider: string (醫院/醫師/clinic)
- details: text
- attachments: JSONB (url 列表)
- verified: boolean default false
- verifiedBy: UUID | null (User.id)
- verifiedAt: timestamp | null
- createdBy: UUID
- createdAt, updatedAt
- deletedAt: timestamp | null

7) AuditLog
- id: UUID
- actorId: UUID | null
- action: string (e.g., "APPLICATION:UPDATE_STATUS")
- targetType: string (e.g., "Application")
- targetId: UUID | null
- before: JSONB | null
- after: JSONB | null
- timestamp

8) Notification
- id: UUID
- userId: UUID
- channel: enum { IN_APP, EMAIL, SMS }
- type: string
- payload: JSONB
- status: enum { PENDING, SENT, FAILED }
- sentAt: timestamp | null
- createdAt

9) Conversation / Message (簡易 in-app messaging)
- conversationId: UUID
- participants: UUID[]
- lastMessageAt: timestamp
- messages can存在 Message table:
  - id, conversationId, senderId, content, attachments[], createdAt, readBy[]

10) BackgroundJob / JobStatus (選項)
- id, type, payload, status, attempts, lastError, createdAt, runAt

---

## 關聯總覽
- User 1:N Animal (ownerId)
- Shelter 1:N Animal (shelterId)
- Animal 1:N Application
- User 1:N Application (applicantId)
- Animal 1:N MedicalRecord
- Animal 1:N Image
- Application 可參考多個 Image / attachments

---

## 狀態機 / 轉換（範例）
- Animal: DRAFT -> SUBMITTED (owner submits) -> PUBLISHED (admin approves) -> RETIRED (adopted or removed)
- Application: PENDING -> UNDER_REVIEW -> APPROVED/REJECTED -> CLOSED
- MedicalRecord: unverified (created) -> verified -> disputed (optional) -> archived

---

## 資料約束與驗證要點
- User.email 與 username 必須唯一且不可為空。
- Animal 必須至少有 1 張圖片（在 API / UI 層強制），location 必填。
- Application 在相同 applicantId + animalId 有未結案狀態時，不允許再建立新的申請（或改以更新 existing draft）。
- MedicalRecord 上傳附件限制：單檔上限 (e.g., 10MB)，允許格式 jpg/png/pdf。
- AuditLog 不可刪除（soft-delete 例外），並記錄變更前後快照。

---

## 索引與效能建議
- Animal: index on (status), index on (species), index on (location / city), GIN index on description / tags (pg_trgm 或 tsvector) 用於搜尋。
- Application: index on (status), index on (animalId), index on (applicantId)
- MedicalRecord: index on (animalId), index on (verified)
- AuditLog: index on (actorId), index on (targetType, targetId), 時間分區 (可選)

---

## Prisma schema 摘要（示例片段，請視實作調整）
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  username     String   @unique
  email        String   @unique
  passwordHash String?
  role         Role     @default(MEMBER)
  phoneNumber  String?
  verifiedEmail Boolean @default(false)
  disabled     Boolean  @default(false)
  animals      Animal[] @relation("OwnerAnimals")
  applications Application[] @relation("ApplicantApplications")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum Role { MEMBER OWNER SHELTER ADMIN }

model Animal {
  id           String      @id @default(uuid())
  ownerId      String?
  owner        User?       @relation(fields: [ownerId], references: [id], name: "OwnerAnimals")
  shelterId    String?
  name         String?
  species      Species
  breed        String?
  sex          Sex
  ageMonths    Int?
  approximateAge String?
  description  String?
  status       AnimalStatus @default(DRAFT)
  images       Image[]
  medicalRecords MedicalRecord[]
  applications Application[]
  location     Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum Species { DOG CAT }
enum Sex { MALE FEMALE UNKNOWN }
enum AnimalStatus { DRAFT SUBMITTED PUBLISHED RETIRED }

model Image {
  id         String  @id @default(uuid())
  url        String
  ownerId    String
  ownerType  String
  altText    String?
  createdAt  DateTime @default(now())
}

model Application {
  id          String   @id @default(uuid())
  type        ApplicationType
  animalId    String
  animal      Animal   @relation(fields: [animalId], references: [id])
  applicantId String
  applicant   User     @relation(fields: [applicantId], references: [id], name: "ApplicantApplications")
  answers     Json
  status      ApplicationStatus @default(PENDING)
  submittedAt DateTime @default(now())
  reviewedAt  DateTime?
  reviewNotes String?
}

enum ApplicationType { ADOPTION REHOME }
enum ApplicationStatus { PENDING UNDER_REVIEW APPROVED REJECTED WITHDRAWN CLOSED }

model MedicalRecord {
  id         String  @id @default(uuid())
  animalId   String
  animal     Animal  @relation(fields: [animalId], references: [id])
  recordType MedicalRecordType
  date       DateTime
  provider   String
  details    String
  attachments Json?
  verified   Boolean @default(false)
  verifiedBy String?
  verifiedAt DateTime?
  createdBy  String
  createdAt  DateTime @default(now())
}

enum MedicalRecordType { TREATMENT CHECKUP VACCINE }
```

---

## DTO / API 請求範例（JSON）

- Create Animal (POST /animals)
```json
{
  "name": "小黑",
  "species": "DOG",
  "breed": "Mixed",
  "sex": "MALE",
  "ageMonths": 24,
  "description": "溫馴，有接種疫苗",
  "location": {"city":"Taipei","region":"Xinyi"},
  "images": ["s3://bucket/key1.jpg"]
}
```

- Submit Application (POST /applications)
```json
{
  "animalId": "uuid-animal",
  "applicantId": "uuid-user",
  "answers": {"q1":"有飼養經驗","q2":"可每周到訪"}
}
```

- Create Medical Record (POST /animals/{id}/medical-records)
```json
{
  "recordType":"VACCINE",
  "date":"2025-10-01",
  "provider":"Happy Vet Clinic",
  "details":"Rabies vaccine",
  "attachments": ["s3://bucket/vaccine1.jpg"]
}
```

---

## 範例查詢/Reporting（常見需求）
- 列出可領養動物（PUBLISHED）按距離或城市分頁
- 依 status 統計每月申請量（report for admins）
- 列出待驗證醫療紀錄與其來源（飼主/收容所）

---

## 後續建議
1. 建立 migration 與 Prisma schema 的完整檔案，並產生初始 migration。
2. 實作 Image/Attachment 的上傳服務（signed URL）以避免伺服器直接傳輸大檔。
3. 在 AuditLog 與 MedicalRecord 實作版本控制（history table 或 JSON diff）。
4. 規劃索引策略與全文檢索（Postgres tsvector 或 ElasticSearch）以提升搜尋體驗。

---

*如果您要我將上面的 Prisma 摘要轉成完整 `schema.prisma` 檔並產生 migration，我可以繼續幫您完成。*
