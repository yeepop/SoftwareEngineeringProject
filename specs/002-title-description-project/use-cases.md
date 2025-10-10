# Use Case 圖與說明 — 貓狗領養平台

此文件包含：
- 主要演員（Actors）與使用案例（Use Cases）清單
- Mermaid 與 PlantUML 的 Use Case 圖原始碼（可在支援的渲染器中預覽）
- 範例主要成功路徑（Primary Success Scenario）與例外情境

## 主要演員 (Actors)
- 訪客 (Visitor)：未登入的任何人，可瀏覽公開的動物刊登、查看列表與細節。
- 一般會員 (GENERAL_MEMBER)：已註冊並登入的個人會員（可作為領養者或個人送養者）。可提交申請、上傳刊登、接收平台內通知（Notification Center, MVP）。
- 飼主 / 個人刊登者 (maps to GENERAL_MEMBER)：在文件中出現的 "Owner" 概念對應為個人會員（GENERAL_MEMBER）；若為機構刊登則使用 SHELTER_MEMBER。
- 收容所帳號 (SHELTER_MEMBER)：以機構身份管理多筆動物刊登，通常綁定單一負責人帳號（primaryAccountUser），本版本不支援多成員協作。
- 管理員 (ADMIN)：平台管理員，負責審核、稽核與高權限操作。
- 系統 (System)：負責發送通知、排程工作、發出簽名 URL 等自動化流程。
- 檢驗者/獸醫 (Verifier/Vet)(選用)：負責核實醫療紀錄（若實作醫療驗證流程）。

## 主要使用案例（Use Cases）
- UC-01: 瀏覽動物列表 (Browse Listings)
- UC-02: 查看動物細節 (View Listing Details)
- UC-03: 註冊 / 登入 (Register / Login)
- UC-04: 建立動物刊登 (Create Listing)
- UC-05: 編輯 / 刪除刊登 (Edit / Delete Listing)
- UC-06: 上傳圖片與附件 (Upload Images/Attachments)
- UC-07: 送出領養申請 (Submit Application)
- UC-08: 審核申請 (Review Application)
- UC-09: 管理醫療紀錄 (Add/Edit Medical Record)
- UC-10: 驗證醫療紀錄 (Verify Medical Record)
-- UC-11: 站內即時訊息 (In-app Messaging) — Deferred (MVP 不包含)
- UC-12: 收到通知 (Receive Notifications)
- UC-13: 管理後台與報告 (Admin Dashboard & Reports)

---

## Mermaid Use Case 圖（可在支援 Mermaid 的 editor 預覽）

註：Notification Center 為 MVP（平台內通知為首要）；外部通道 Email/SMS 與 in-app direct messaging 為 Deferred。

```mermaid
%%{init: {"theme":"default"}}%%
usecaseDiagram

actor Visitor as V
actor GENERAL_MEMBER as GM
actor SHELTER_MEMBER as SM
actor ADMIN as A
actor System as Sys

V --> (Browse Listings)
V --> (View Listing Details)

GM --> (Register / Login)
GM --> (Browse Listings)
GM --> (View Listing Details)
GM --> (Submit Application)
GM --> (通知系統 / Notification)
GM --> (Receive Notifications)

// 個人刊登者行為由 GENERAL_MEMBER 承擔
GM --> (Create Listing)
GM --> (Edit / Delete Listing)
GM --> (Review Application)
GM --> (Manage Medical Record)

SM --> (Create Listing)
SM --> (Manage Medical Record)

A --> (Review Application)
A --> (Manage Listings)
A --> (Manage Users)
A --> (Admin Dashboard & Reports)

Sys --> (Receive Notifications)
Sys --> (Upload Images/Attachments)

(Browse Listings) .> (View Listing Details) : include
(Submit Application) .> (通知系統 / Notification) : include
(Manage Medical Record) .> (Verify Medical Record) : extend
```

---

## PlantUML Use Case 圖（適合使用 PlantUML/IDE 擴充套件渲染）

註：Notification Center 為 MVP（平台內通知為首要）；外部通道 Email/SMS 與 in-app direct messaging 為 Deferred。

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor Visitor
actor GENERAL_MEMBER
actor SHELTER_MEMBER
actor ADMIN
actor System as Sys

package "Public" {
  (Browse Listings)
  (View Listing Details)
}

package "User Actions" {
  (Register / Login)
  (Submit Application)
  (通知系統 / Notification)
  (Receive Notifications)
}

package "Owner / Shelter" {
  (Create Listing)
  (Edit / Delete Listing)
  (Review Application)
  (Manage Medical Record)
}

package "Admin" {
  (Manage Listings)
  (Manage Users)
  (Admin Dashboard & Reports)
}

Visitor --> (Browse Listings)
Visitor --> (View Listing Details)

GENERAL_MEMBER --> (Register / Login)
GENERAL_MEMBER --> (Browse Listings)
GENERAL_MEMBER --> (View Listing Details)
GENERAL_MEMBER --> (Submit Application)
GENERAL_MEMBER --> (通知系統 / Notification)
GENERAL_MEMBER --> (Receive Notifications)

// 個人刊登者由 GENERAL_MEMBER 表示
GENERAL_MEMBER --> (Create Listing)
GENERAL_MEMBER --> (Edit / Delete Listing)
GENERAL_MEMBER --> (Review Application)
GENERAL_MEMBER --> (Manage Medical Record)

SHELTER_MEMBER --> (Create Listing)
SHELTER_MEMBER --> (Manage Medical Record)

ADMIN --> (Manage Listings)
ADMIN --> (Manage Users)
ADMIN --> (Admin Dashboard & Reports)

Sys --> (Receive Notifications)
Sys --> (Upload Images/Attachments)

@enduml
```

---

## 範例使用案例細節：UC-07 送出領養申請（Submit Application）

Primary Actor: Member
Stakeholders: Applicant, Animal Owner, Admin
Preconditions: 使用者已登入；動物狀態為 PUBLISHED
Trigger: 使用者在動物詳情頁按下「送出申請」

Main Success Scenario:
1. Applicant 開啟動物詳情頁，按下「送出申請」。
2. 系統顯示申請表單（含問題、聯絡資訊、行為金錢承諾等欄位）。
3. Applicant 填寫表單並上傳必要附件（身分證明、居住證明等）。
4. Applicant 提交申請；系統建立 Application（status = PENDING），紀錄 submittedAt，並觸發通知給 Owner 與 Admin。
5. Owner/Assigned admin 在後台看到新申請，開始審核（轉為 UNDER_REVIEW）。
6. 若審核通過，Owner/ Admin 將 Application 設為 APPROVED，系統通知 Applicant（並觸發後續領養流程：安排面談或交接）。

Extensions / Exception Flows:
- 3a. 若必填欄位遺漏，系統回傳錯誤並顯示欄位驗證訊息。
- 4a. 若 Applicant 在相同 animalId 已有未結案申請，系統阻止重複送出或提示更新現有申請。
- 4b. 附件上傳失敗：系統回滾申請建立、記錄錯誤，提示 Applicant 重試或稍後再試。

Success End Condition: Application 狀態為 PENDING 並通知已送出。

---

## 詳細 Use Cases (expanded)

### UC-01: 瀏覽動物列表 (Browse Listings)
Primary Actor: Visitor / GENERAL_MEMBER
Stakeholders: Browsers, Platform, Animal Owners
Preconditions: Database contains at least one PUBLISHED animal or relevant listings; public listing visibility rules applied.
Trigger: User opens the listings page or performs a search/filter action.

Main Success Scenario:
1. Client requests GET /animals?filters... (page,size,q,species,city,...).
2. Server validates query parameters and applies permission filters.
3. Server queries DB using indexes and returns paginated results with minimal animal card data (id,name,species,thumbnail,status).
4. Client renders the list and allows paging or infinite scroll for more results.

Alternative Flows / Exceptions:
- A1: Invalid query params -> 400 with validation details.
- A2: Page beyond available results -> 200 with empty items and metadata (page,size,total=...).
- A3: DB timeout -> 503/Retry-After.

Postconditions: User sees correct, paginated list of animals matching filters.

Acceptance Criteria:
- GET /animals returns 200 and includes pagination metadata (page,size,total).
- Server must respond within 500ms P95 under normal load (NFR target).

API Notes: Recommend indexes on (status,species,city,createdAt) and full-text index on name/description.

### UC-02: 查看動物細節 (View Listing Details)
Primary Actor: Visitor / GENERAL_MEMBER
Stakeholders: Applicant, Owner, Platform
Preconditions: animalId exists; visibility/published checks pass for the requester.
Trigger: User clicks an animal card or navigates to /animals/{id}.

Main Success Scenario:
1. Client requests GET /animals/{id}.
2. Server validates visibility and fetches animal, images (limit N), recent medicalSummary, shelter/owner public info.
3. Server returns 200 with detailed payload including images array, medicalSummaries (only verified snippets unless authorized), and contact/public info.
4. Client displays detail page with images, metadata and action CTA (Apply) where applicable.

Alternative Flows:
- A1: animal not found or deleted -> 404.
- A2: unauthorized to view restricted details -> 200 with masked fields and note about verification requirements.
- A3: images missing -> return placeholder metadata; client displays default image.

Postconditions: Detail page rendered; if user is GENERAL_MEMBER and animal.status == PUBLISHED, CTA to apply is visible.

Acceptance Criteria:
- GET /animals/{id} returns required fields and no sensitive info for unauthorized users.
- Images load with pre-signed URLs; missing images handled gracefully.

API Notes: Consider caching frequent read endpoints (edge cache / CDN for images and thumbnails).

### UC-03: 註冊 / 登入 (Register / Login)
Primary Actor: Visitor
Stakeholders: User, Platform (auth), Admin
Preconditions: None for registration; login requires existing verified account.
Trigger: Visitor submits registration or login form.

Main Success Scenario (Register):
1. Client POST /auth/register {email,password,username}.
2. Server validates input, creates User (role=GENERAL_MEMBER), writes AuditLog, enqueues verification email job, and returns 201 with id and verificationSent flag.
3. User receives verification email (deferred external delivery) and verifies account via GET /auth/verify?token=...

Main Success Scenario (Login):
1. Client POST /auth/login {email,password}.
2. Server validates credentials, issues accessToken + refreshToken, returns 200.

Alternative Flows:
- A1: Duplicate email on register -> 409.
- A2: Invalid credentials on login -> 401.
- A3: Rate limit triggered on repeated failed attempts -> 429 and potentially lockout rules.

Postconditions: Registered user created (unverified) or user authenticated with token.

Acceptance Criteria:
- Registration returns 201 and enqueues verification; login returns tokens on success.

API Notes: Use bcrypt/argon2 for password hashing and limit login attempts (rate limiting / account lockout).

### UC-04: 建立動物刊登 (Create Listing)
Primary Actor: GENERAL_MEMBER or SHELTER_MEMBER
Stakeholders: Owner/Publisher, Platform, Admin
Preconditions: Actor authenticated; if creating as SHELTER_MEMBER, actor must be primaryAccountUser for the shelter.
Trigger: User fills publish form and submits.

Main Success Scenario:
1. Client POST /rehomes {animal payload, images refs, medicalSummary, attachments?} with Idempotency-Key optional.
2. Server validates payload, stores metadata, creates Animal record with status=SUBMITTED, writes AuditLog, enqueues images processing jobs, and returns 201 with id/status.
3. Admin is notified for review; owner sees record in "my listings".

Alternative Flows:
- A1: Missing mandatory fields -> 400.
- A2: Image processing fails -> 202 Accepted with jobId; record created but images pending.
- A3: Duplicate submission with same Idempotency-Key -> return existing resource or 409 per idempotency policy.

Postconditions: Animal record exists with SUBMITTED status awaiting review.

Acceptance Criteria:
- POST /rehomes returns 201 with resource id; images are processed asynchronously with job tracking available.

API Notes: Support Idempotency-Key for create endpoints; validate owner/shelter permissions server-side.

### UC-05: 編輯 / 刪除刊登 (Edit / Delete Listing)
Primary Actor: GENERAL_MEMBER (owner) or SHELTER_MEMBER or ADMIN
Stakeholders: Publisher/Owner, Applicants, Admin
Preconditions: Actor authenticated and authorized to modify the Animal record (ownerId or shelterId or admin).
Trigger: Actor submits update or delete action.

Main Success Scenario (Edit):
1. Client PATCH /animals/{id} {fields... , expectedVersion?}.
2. Server validates authorization and expectedVersion for optimistic locking.
3. Server updates record, increments version, writes AuditLog, and returns 200 with updated resource.

Main Success Scenario (Delete/Soft-delete):
1. Client DELETE /animals/{id}.
2. Server marks deletedAt timestamp (soft-delete), writes AuditLog, notifies active applicants, and returns 200.

Alternative Flows:
- A1: Unauthorized -> 403.
- A2: Version conflict -> 409 with currentVersion.
- A3: Delete with active approved adoption process -> block or require admin confirmation depending on policy.

Postconditions: Resource updated or soft-deleted; applicants and watchers notified as applicable.

Acceptance Criteria:
- PATCH returns 200 and respects optimistic locking; DELETE performs soft-delete and returns 200.

## 建議（如何使用此檔案）
API Notes: For large updates or image replacements, prefer multipart upload or pre-signed upload flow.

---

### UC-06: 上傳圖片與附件 (Upload Images/Attachments)
Primary Actor: GENERAL_MEMBER / SHELTER_MEMBER
Stakeholders: Publisher, Platform, Storage Provider
Preconditions: Actor authenticated; client has binary files ready; pre-signed upload endorsement available if using direct-to-storage.
Trigger: User uploads images or attachments from publish/edit flows.

Main Success Scenario:
1. Client requests presign via POST /uploads/presign {filename,mimeType,size} or POST /uploads to upload through API.
2. Server returns presigned URL or accepts binary and stores object in object storage; server records storageKey metadata.
3. Client (or server) confirms upload; server creates Attachment record with ownerType/ownerId (or pending owner association) and returns 201.

Alternative Flows:
- A1: File exceeds size/format limits -> 413/422 with validation message.
- A2: Presigned URL expired -> 400/403; client obtains new presign and retries.
- A3: Storage provider transient error -> 502/503 and retry guidance.

Postconditions: Attachment record exists with storageKey and is available for association to animal/application/medical record.

Acceptance Criteria:
- Presign flow provides short-lived URLs; Attachment metadata persisted and retrievable.

API Notes: Store mimeType and size; consider virus scanning and content moderation pipeline for uploads.

### UC-07: 送出領養申請 (Submit Application)
Primary Actor: GENERAL_MEMBER
Stakeholders: Applicant, Owner (GENERAL_MEMBER or SHELTER_MEMBER), Admin
Preconditions: Applicant authenticated; animal.status == PUBLISHED; applicant is not the owner of the animal.
Trigger: Applicant submits application form on animal detail page.

Main Success Scenario:
1. Client POST /applications with body {animalId,answers,attachmentIds?} and optional Idempotency-Key header.
2. Server verifies eligibility, checks idempotency, creates Application (status=PENDING, version=1), writes AuditLog, creates Notification records for owner and admin, returns 201 with application id.
3. Applicant sees application in My Applications; owner/admin see notification in Notification Center.

Alternative Flows:
- A1: Duplicate open application exists -> 409 or return existing application per UX rule.
- A2: Attachment references invalid -> 422.
- A3: Idempotency-Key reused with different payload -> 409 and diagnostic info.

Postconditions: Application persisted; notifications enqueued; optional external delivery queued (deferred).

Acceptance Criteria:
- POST /applications returns 201 and application is queryable by applicant and owner.

API Notes: Enforce idempotency-key uniqueness and TTL; validate applicant != owner.

### UC-08: 審核申請 (Review Application)
Primary Actor: GENERAL_MEMBER (owner) or SHELTER_MEMBER or ADMIN
Stakeholders: Applicant, Owner, Admin
Preconditions: Actor authenticated and authorized; application exists and is in a reviewable state.
Trigger: Reviewer selects an application and triggers a review action.

Main Success Scenario:
1. Client POST /applications/{id}/review {action,notes,assigneeId?,expectedVersion?}.
2. Server verifies permissions and expectedVersion; updates application.status and/or assignee, increments version, writes AuditLog, creates Notification records, returns 200 with updated resource.

Alternative Flows:
- A1: expectedVersion mismatch -> 409 with currentVersion.
- A2: Unauthorized reviewer -> 403.
- A3: Illegal state transition -> 400.

Postconditions: Application status updated; AuditLog and Notifications recorded.

Acceptance Criteria:
- Review endpoint enforces optimistic locking; state transitions logged and notify stakeholders.

API Notes: Provide currentVersion in responses to help UI maintain optimistic locking.

### UC-09: 管理醫療紀錄 (Add/Edit Medical Record)
Primary Actor: GENERAL_MEMBER (owner), SHELTER_MEMBER, ADMIN
Stakeholders: Animal records, Applicants, Admin
Preconditions: Actor authenticated and authorized for the animal.
Trigger: Actor submits new medical record or edits an existing one.

Main Success Scenario (Create):
1. Client POST /animals/{id}/medical-records {recordType,date,provider,details,attachmentIds?}.
2. Server creates MedicalRecord (verified=false), writes AuditLog, enqueues admin verification notification, returns 201.

Alternative Flows:
- A1: Attachment invalid -> 422.
- A2: Unauthorized -> 403.

Postconditions: MedicalRecord persisted and visible as unverified until verification.

Acceptance Criteria:
- Medical record creation returns 201 and appears in admin queue.

API Notes: Keep attachments as references to Attachment records.

### UC-10: 驗證醫療紀錄 (Verify Medical Record)
Primary Actor: ADMIN (or Verifier)
Stakeholders: Owner, Applicants, Admin
Preconditions: MedicalRecord exists and verified==false; actor authorized.
Trigger: Admin triggers verification action.

Main Success Scenario:
1. Client POST /medical-records/{id}/verify {verified:true|false,notes}
2. Server updates record (verified,verifiedBy,verifiedAt), writes AuditLog, notifies creator, returns 200.

Alternative Flows:
- A1: Already verified -> 409 or idempotent 200 depending on implementation.
- A2: Unauthorized -> 403.

Postconditions: MedicalRecord marked verified (true/false) and visible accordingly.

Acceptance Criteria:
- Verification updates record and generates AuditLog and Notification.

API Notes: Preserve a history of changes for auditability (versioning or audit entries).

---

### UC-11: 站內即時訊息 (In-app Messaging) — Deferred
Primary Actor: (Future) GENERAL_MEMBER
Stakeholders: Users
Preconditions: Feature deferred for MVP; design recorded for future implementation.
Trigger: N/A for MVP.

Main Success Scenario (future):
1. Client opens conversation and sends message to participant(s).
2. Server persists Message linked to Conversation, enqueues Notification records for recipients, returns 201.

Notes: This feature is explicitly DEFERRED for MVP. If required later, model as Conversation + Message tables with participants array and soft-delete, and consider real-time delivery via WebSocket / Push.

### UC-12: 收到通知 (Receive Notifications)
Primary Actor: GENERAL_MEMBER / SHELTER_MEMBER / ADMIN
Stakeholders: All users, Platform
Preconditions: Notification records created by system events.
Trigger: Client polls or subscribes to Notification feed (GET /notifications or websocket subscription).

Main Success Scenario:
1. Client GET /notifications?recipientId={me}&unreadOnly=true or websocket event delivers new notification.
2. Server returns list of recent notifications with payload, read flag, createdAt and delivery metadata.
3. Client marks notifications read via POST /notifications/{id}/mark-read; server updates read flag and writes AuditLog.

Alternative Flows:
- A1: Delivery worker failed to send external channel -> Notification.externalDeliveryStatus shows FAILED; UI displays notice.

Postconditions: User sees notifications; read state persisted.

Acceptance Criteria:
- GET /notifications returns recent items and supports pagination and filtering by read/unread.

API Notes: Prefer polling for MVP and add websocket/Push in next iterations.

### UC-13: 管理後台與報告 (Admin Dashboard & Reports)
Primary Actor: ADMIN
Stakeholders: Admins, Platform Owners
Preconditions: Admin authenticated with sufficient privileges.
Trigger: Admin navigates to dashboard or requests reports.

Main Success Scenario:
1. Client GET /admin/dashboard or request specific report endpoints (jobs, audit, metrics).
2. Server validates admin scope and returns aggregated metrics (counts by status, queue lengths, recent failures, key KPIs) and paginated resources for drill-down.
3. Admin can take action (re-run job, flag record, export data) depending on permissions; actions are recorded in AuditLog.

Alternative Flows:
- A1: Insufficient privileges -> 403.
- A2: Large export request -> 202 with jobId and downloadable link when ready.

Postconditions: Admin obtains metrics and can act on actionable items.

Acceptance Criteria:
- Dashboard endpoints return accurate aggregated KPIs; exports are job-based and trackable.

API Notes: Secure admin endpoints; throttle/export via job pattern with role-based access control.

## 建議（如何使用此檔案）
- 若要在 README 或 Confluence 嵌入圖形，請使用支援 Mermaid 或 PlantUML 的渲染器。
- 我可以把 Mermaid 圖轉成 SVG/PNG 並放入 `specs/002-title-description-project/assets/`（需要你允許我產生圖片檔）。
- 若你有特定的 UML 工具偏好（PlantUML 或 draw.io），告訴我，我會輸出相應格式或直接建立檔案。

---

文件位置：`specs/002-title-description-project/use-cases.md`

如果你想要我把這個 Use Case 圖放進 README 或自動建立 PR，告訴我下一步。