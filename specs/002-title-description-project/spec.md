# Feature Specification: 貓狗領養平台 — 規格更新

**Feature Branch**: `002-title-description-project`  
**Created**: 2025-10-09  
**Status**: Draft  
**Input**: 使用者提交之平台願景、任務、目標與功能需求（詳見提交內容）

## User Scenarios & Testing *(mandatory)*

此規格以「讓更多人以領養代替購買」為核心目標，優先支援會員瀏覽與提出領養申請、飼主發佈送養、以及管理員的審核流程。


## Roles & Permissions

| 角色                          | 定位與主要目標                 | 權限範圍               | 主要操作項目                                                                      | 是否可編輯資料             |
| --------------------------- | ----------------------- | ------------------ | --------------------------------------------------------------------------- | ------------------- |
|**訪客（Visitor）**          | 一般瀏覽者，尚未註冊會員。           | 只能查看公開資訊           | - 瀏覽動物清單<br>- 篩選、搜尋<br>- 檢視基本資料與照片                                          | ❌ 否                 |
|**會員（Member）**           | 已註冊的個人使用者（可為領養者或個人送養者）。 | 建立/申請/管理個人刊登與申請      | - 建立個人資料與偏好設定<br>- 建立或管理個人送養刊登<br>- 提出領養申請（不得對自己刊登的動物提出申請）<br>- 接收通知（Email/SMS） | ⭕ 可編輯個人資料與申請內容（審核前） |
|**收容所（Shelter）帳號**     | 代表收容所的組織帳號，由單一負責人（或代理人）以機構身份操作。 | 機構級管理（批次操作，但不含成員管理）   | - 批次新增/匯入動物<br>- 管理機構內申請、報表與狀態（單一負責人操作）<br>- 指派/處理機構相關工作（以該負責人為操作者）                       | ⭕ 可編輯所屬收容所動物資料      |
|**管理員（Admin）**          | 平台後台人員，負責稽核、控管與維護整體運作。  | 最高權限，可檢視與管理所有資料    | - 審核飼主與收容所帳號<br>- 審核新刊登的動物資訊<br>- 稽核醫療紀錄與領養紀錄<br>- 處理檢舉、封鎖帳號<br>- 系統公告與通知設定 | ⭕ 可新增／編輯／刪除任何資料     |


_註：為了簡化使用者模型，實作建議使用一個 `role` 欄位來表示主要身份：`role` = Visitor | Member | Shelter | Admin。預設情況下，`Shelter` 為單一負責人帳號，不支援內建的多成員管理（即暫不需 `shelterMemberships` 關聯）。若未來需支援多名 staff 協作，則可在後續迭代引入 `shelterMemberships` 或單獨的組織/人員模型。_

_備註：實作時請採 RBAC 與最小權限原則，並對管理員引入分級（Content Admin / Support Admin / Super Admin）與完整 AuditLog 審計。_

### User Story 1 - 瀏覽列表並搜尋/篩選動物 (Priority: P1)

描述：任何訪客或已登入會員可以在「可領養動物」頁面瀏覽列表，套用篩選與排序（物種、年齡、性別、縣市、關鍵字），並使用分頁或無限滾動查看結果。

Roles: Visitor, Member, Owner, Shelter, Admin — 所有角色皆可瀏覽公開列表；Admin/Owner/Shelter 在登錄或經授權的情況下可查看未公開或待審核的自有刊登（以 RBAC 控制）。

**Why this priority**: 使用者尋找目標動物是平台的第一步，直接影響流量轉換與申請數量。

**Independent Test**: 未登入訪客或已登入會員在列表頁能夠使用至少 4 個不同篩選條件並得到符合條件的結果，分頁或滾動載入下一頁內容。

**Acceptance Scenarios**:

1. **Given**: 使用者進入列表頁， **When**: 選擇物種 = DOG 且 縣市 = Taipei， **Then**: 顯示所有符合條件的狗狗，且結果數量與分頁資訊正確。
2. **Given**: 使用者使用關鍵字搜尋（例如 "米克斯"）， **When**: 點選搜尋， **Then**: 顯示包含關鍵字的動物卡片，關鍵字高亮或在結果摘要中顯示。
3. **Given**: 使用者啟用排序（例如依上架時間）， **When**: 點選排序選單， **Then**: 清單以正確順序更新，且分頁正常運作。

**Edge cases**:
- 無符合條件結果時顯示友善提示與推薦（例如熱門動物）。
- 篩選參數組合過多或不合理時仍可回傳空結果但不崩潰。

---


### User Story 2 - 動物詳情檢視 (Priority: P1)

描述：使用者從清單進入個別動物詳情頁，頁面顯示多張圖片（圖片檢視器）、完整描述、近期醫療紀錄摘要，以及送養者（飼主或收容所）的非敏感公開資訊（例如縣市、收容所名稱、刊登者簡介）。頁面提供主要行動按鈕：「提出申請」。

Roles: Visitor, Member, Owner, Shelter, Admin — 詳情頁的基本資訊對所有角色公開；互動行為「提出申請」僅在登入且 role = Member 時啟用。Owner / Shelter 對其所屬刊登看到額外控制（編輯、下架、查看該刊登的申請列表）；Admin 可查看並干預所有詳情與申請流程。


**Why this priority**: 動物詳情頁是使用者做出是否提出領養申請的關鍵接觸點，提供充分且可信的資訊（圖片、醫療摘要、刊登者信任指標）會顯著提升申請轉換率與平台信任，因此列為 P1。

**Independent Test**: 點開任一動物卡片，能看到圖片輪播（若存在 >=1 張）、基本欄位（名稱、年齡、性別、描述）、醫療紀錄摘要與「提出申請」按鈕；已登入 Member 點擊「提出申請」會顯示申請表單並能提交 Application（status: PENDING）。


**Acceptance Scenarios**:

1. **Given**: 動物存在醫療紀錄， **When**: 使用者進入詳情頁， **Then**: 顯示最近三筆醫療紀錄摘要並提供「查看全部醫療紀錄」連結（完整紀錄視權限顯示）。

2. **Given**: 動物為送養狀態 PUBLISHED， **When**: 已登入且 role = Member 的使用者點擊「提出申請」， **Then**: 顯示申請表單；提交後建立 Application（status: PENDING），並通知刊登者與管理員。

3. **Given**: 動物為送養狀態 PUBLISHED， **When**: 已登入且 role = Member 的使用者點擊「提出申請」後， **Then**: 申請出現於會員「我的申請」列表，且狀態為 PENDING（可在列表中查看提交時間與審核狀態）。

**Edge cases**:

- 圖片缺失時顯示預設占位圖與替代文字。
- 私有或受限制的聯絡資訊不直接顯示；如需交換聯絡方式，流程應透過申請通過後或管理員介入的方式進行（聯絡交換機制視下個版本設計）。
- 申請者重複提交或惡意大量申請：系統需在後端執行重複檢查與頻率限制（rate limit）。

**Tests / QA checks**:

- 前端：未登入使用者點擊「提出申請」時應提示需登入（401 或轉導至登入）；已登入 Member 能開啟申請表單並送出；提交後 UI 顯示已送達或失敗狀態。
- 後端：POST /applications 檢驗 applicantId 與 animalId 的合法性，並在成功時回傳 201 與 Application 物件；若頻率或重複提交回傳 409/429。
- Integration：驗證通知機制在申請提交後會發送 email/SMS 並在通知記錄中建檔；模擬 provider failure 並檢視重試行為。

Notes:

- 與上一版相比，主動聯絡刊登者的「聯絡請求 / ContactRequest」功能已在 MVP 階段刪除；若日後需要再提出設計需求以便在次要迭代加入。

**Business rules: 申請行為與角色限制**

- 為避免利益衝突與錯誤操作，系統 MUST 拒絕由屬於某收容所（Shelter）的帳號以該機構身份對同一機構下的動物提出領養申請。若該收容所操作人要以個人身分申請，必須使用個人 Member 帳號或透過明確的「切換為個人身分」流程（含顯式確認與紀錄）。
- 系統 MUST 拒絕 Owner 對自己刊登的動物提出申請（403 Forbidden），以避免自動化錯誤或濫用。
 - 若使用者同時擁有多重身份（例如同時為 Member 與 Shelter），系統需要求操作上下文（actingAs: PERSONAL | SHELTER）於提交申請時明確指定，並在 audit log 中記錄該上下文。

API behaviour (pseudo):

- POST /applications { applicantId, animalId, answers, attachments?, actingAs? }
	- Server checks: applicant role & shelter relationship; if applicant is a Shelter account and animal.shelterId in sheltersOfUser(applicantId) => 403 {code: 'forbidden_by_role', reason: 'shelter_account_cannot_apply_for_own_shelter_animals'}
	- If applicantId == animal.ownerId => 403 {code: 'forbidden_by_role', reason: 'owner_cannot_apply_for_own_listing'}
	- On success => 201 with Application object and applicantRole & actingAs recorded.

UI rules:

- 對於不允許提交申請的使用者（例如 Shelter 帳號對自家 animal 或 Owner 對自家 animal），應在詳情頁上隱藏或 disable 「提出申請」按鈕，並顯示 tooltip/說明（例如「您的帳號為該收容所帳號，請使用個人帳號提出申請」）。
- 若支援同一帳號切換上下文（actingAs），需在 UI 顯示當前操作身份並要求二次確認。

Audit / logging:

- 所有被拒的嘗試（403）應記錄 AuditLog {actorId, action:'application_attempt', targetType:'animal', targetId, reason, timestamp, actingAs?}。
- 成功建立的 Application 必須包含 applicantRole、actingAs 與 shelterContext（若有），以利稽核與後續追蹤。

QA tests (追加):

- Forbidden case A: Shelter 帳號對自家 shelter 的 animal 提交 -> API 回 403 並在 AuditLog 建一筆 attempt 記錄。
- Forbidden case B: Owner 對自己刊登的 animal 提交 -> API 回 403，UI 應隱藏申請按鈕或顯示禁止訊息。
- Dual-role: 同一帳號在 actingAs=PERSONAL 與 actingAs=SHELTER 下行為不同，測試需驗證 actingAs 欄位被正確儲存與稽核。

---

### User Story 3 - 提出領養申請 (Priority: P1)

描述：已登入的會員能在動物詳情頁提交領養申請，填寫必要欄位（聯絡方式、申請理由、可到訪時間等），並立即在「我的申請」看到該筆申請（狀態 PENDING）。

Roles: Member — 僅限角色為 Member 的使用者可提交領養申請；Owner/Shelter 不得對自己刊登的動物提出申請。API 與 UI 層需 enforce 此限制。

**Independent Test**: 已登入會員提交表單後系統回傳成功，並在 會員 -> 我的申請 列表看到新紀錄，狀態為 PENDING。

**Acceptance Scenarios**:

1. **Given**: 會員填寫完必填欄位， **When**: 點擊送出， **Then**: 申請建立（HTTP 201），並寄送 email 通知給送養者與管理員。
2. **Given**: 欄位驗證失敗（缺少必填）， **When**: 點擊送出， **Then**: 表單顯示錯誤並阻止提交。

**Edge cases**:
- 使用者在提交期間網路中斷：系統應提供重試或草稿快取機制。
- 同一會員重複提交多次：系統應提示已有相似未審核申請。

---



### User Story 4 - 個人會員發佈/管理送養（Member Rehome）(Priority: P1)

描述：個人會員（Member，經系統驗證後）可建立單筆送養刊登，包含至少一張圖片、描述、健康與醫療摘要；在「我的刊登」頁可逐筆編輯或下架該刊登；管理員審核後刊登變為公開 PUBLISHED。

Roles: Member, Admin — 個人 Member 僅能建立/管理自己所屬的刊登；Admin 可審核或直接管理任何刊登（記錄操作者與變更）。

**Independent Test**: 個人 Member 建立送養後紀錄狀態為 SUBMITTED；管理員在後台批准後狀態變更為 PUBLISHED，且在前台可見。

**Acceptance Scenarios**:

1. **Given**: 個人 Member 完成發布且上傳圖片， **When**: 提交， **Then**: 產生 SUBMITTED 紀錄並通知管理員。
2. **Given**: Member 需要修改公開資訊， **When**: 在個人「我的刊登」列表選擇編輯， **Then**: 可更新文字與圖片（圖片需重新上傳或標記保留）。

**Edge cases**:

- 若送養被拒，Member 會收到拒絕理由並可重新提交。
- 若送養中已有正在審核的領養申請，Member 下架或刪除時需提示後續影響（例如通知已提交申請者）。

---

### User Story 5 - 收容所刊登與機構管理（Shelter Rehome & Dashboard） (Priority: P1)

描述：收容所（Shelter）以機構身份由單一負責人操作，支援批次上傳、工作指派與報表匯出等功能（注意：本版本不支援收容所內的成員邀請或多帳號協作）。收容所刊登應與個人 Owner 的刊登分開呈現並標記為機構來源（例如顯示收容所名稱與機構徽章）。

Roles: Shelter, Admin — Shelter 帳號由單一負責人操作，Admin 可查核與介入。

**Independent Test**: Shelter 帳號能夠透過 /shelters/{id}/animals/batch 上傳一個含 20 筆動物的 CSV，系統回傳 jobId（202 Accepted），背景工作完成後建立動物並更新 job 狀態與匯入統計；Shelter 操作者能在儀表板查看並處理該 shelter 的申請清單。

**Acceptance Scenarios**:

1. **Given**: Shelter 操作者上傳 CSV/JSON 到 POST /shelters/{id}/animals/batch， **When**: 上傳成功， **Then**: 系統回傳 jobId（202 Accepted），背景工作完成後建立動物並更新匯入統計。

2. **Given**: Shelter 操作者需要指派某申請給外部聯絡人或管理員， **When**: 在儀表板中標示 assignee 或發出通知， **Then**: 系統儲存指派紀錄並更新 Application.assigneeId（若為外部人員，則以該外部人員的帳號識別）。

3. **Given**: Shelter 帳號同時被多名人員共用（例如由不同人透過共同帳密或 SSO 存取）， **When**: 多人同時處理申請， **Then**: 系統應以 assignment/lock 機制避免同一申請被重複處理（建議在後端使用 optimistic locking 或 assignment workflow）。

**Edge cases**:

- 若 Shelter 尚未完成驗證或被暫停：其刊登可能設為限制可見或標記為待驗證，直至管理員核准。
- 批次匯入失敗部分紀錄：系統需提供錯誤報表與可重試的失敗清單。

**Tests / QA checks**:

- Permission: Shelter 帳號嘗試修改屬於其他 shelter 的動物應回傳 403。
- Bulk import: 上傳 50 筆樣本檔案後監控 job 狀態並驗證成功建立筆數與錯誤清單。

**Notes**: 本版本假定 Shelter 為單一負責人帳號；若未來需支援正式的多成員機構管理，將在後續迭代引入 invite/roles 機制與 shelterMemberships 關聯。

---


### User Story 5 - 飼主 / 收容所 審核（收養者選擇）(Priority: P2)

描述：當會員對已刊登的動物提出領養申請時，負責該刊登的審核人（個人 Owner 或被授權的 Shelter / Shelter 操作者）可在管理頁檢視該動物的申請清單、查看申請者摘要與問卷內容，並對申請進行流程性標記（如 UNDER_REVIEW、ACCEPTED、REJECTED）。審核流程需支援「指派 (assign)」、「鎖定 (lock)」與「覆核 (escalation)」，以避免多人同時審核造成競爭狀態。

Roles: Owner, Shelter, Admin —

- Owner（個人飼主）: 對自己刊登的動物執行審核動作（查看申請詳情、標記 UNDER_REVIEW / ACCEPTED / REJECTED、提供審核備註）；Owner 不支援跨帳號指派多人處理。
-- Shelter（收容所）: 以 Shelter 帳號（單一負責人）身份操作，支援指派申請給外部聯絡人或在儀表板中處理申請，並能批次更新狀態（視平台設定）。
- Admin（平台管理員）: 可介入或覆核任意申請、解除鎖定、查看完整 audit log，並在需要時強制更改狀態或停權異常帳號。

**Independent Test**: 審核人可在其管理介面將某筆申請標為 UNDER_REVIEW，該狀態立即反映於申請者的「我的申請」頁；Shelter Manager 可將申請指派給特定 staff，並在該 staff 的任務清單看到被指派的項目。

**Acceptance Scenarios**:

1. **Given**: 多筆申請存在， **When**: 審核人（Owner 或 Shelter / Shelter 操作者）選擇一筆標記為 UNDER_REVIEW， **Then**: 系統應記錄該操作者與時間，並將該筆申請狀態更新為 UNDER_REVIEW；系統應阻止其他人同時將另一筆設定為同一時段的 UNDER_REVIEW（可透過 assignment 或 business rule 實作）。

2. **Given**: Shelter Manager 指派某申請給 staffA， **When**: staffA 接受任務並在其儀表板處理， **Then**: Application.assigneeId = staffA.id，處理紀錄記錄 assignee 與處理時間；若 staffA 在處理期間離線，Manager 可重新指派。

3. **Given**: Owner 決定接受某位申請者， **When**: Owner 點選 ACCEPT 並填寫交接/面談備註， **Then**: 申請狀態變更為 APPROVED，系統發送通知給申請者與管理員並在 audit log 留存紀錄；同時其他候補申請應收到狀態更新（例如 REMAINING -> REJECTED 或 WAITLISTED，依平台政策）。

4. **Given**: 多名審核人同時嘗試操作同一申請， **When**: 其中一人先完成 ACCEPT， **Then**: 其他人的請求應回傳 409 或顯示已變更狀態，並提供差異說明（who/when）。

**API / Implementation Notes**:

- POST /applications/{id}/review {action: UNDER_REVIEW|ACCEPT|REJECT, notes?, assigneeId?, expectedVersion?} => 後端驗證 actor 對該 application/animal 的權限，採用 optimistic locking (version) 或資料庫鎖定來避免 race condition；回傳 200 + updated Application 或 409 on version conflict。
- POST /shelters/{id}/applications/{appId}/assign {assigneeId} => 只允許 Shelter Manager/Editor 操作，會在 application 記錄 assigneeId 與 assignedAt。
- GET /applications?ownerId=...&status=SUBMITTED|UNDER_REVIEW => 審核人與管理員用於列單的 API。
- Audit: 每次狀態變更都必須寫入 AuditLog {actorId, action, targetType: 'application', targetId, before, after, notes, timestamp, shelterId?}。

**Edge cases**:

- 飼主誤操作：提供確認對話框與短時間內撤銷 (soft undo) 機制，並可在 audit log 中標示回滾原因。
- 若申請者被停權或刪除帳號：若狀態需變更，審核人應收到警示且流程以手動介入為主（例如系統提示需聯絡管理員）。
- 若 assignee 帶離職或帳號停用：Manager 可重新指派或由 Admin 介入。

**Tests / QA checks**:

- Permission: 使用 Shelter Editor token 嘗試修改非所屬 shelter 的 application -> 回傳 403。
- Concurrency: 同步發起兩次 POST /applications/{id}/review（expectedVersion 相同）-> 其中一個請求回傳 200，另一回傳 409 並附差異資訊。
- Audit: 對 5 次不同的狀態變更檢查 AuditLog 是否都包含 actorId、before/after、timestamp 與 notes（如有）。


---

### User Story 6 - 管理員後台審核與資料管理 (Priority: P1)

描述：管理員在後台可以全面查看並管理申請、動物、會員與收容所資料；可審核送養/領養申請（批准／拒絕／退回）、新增或編輯動物資料與醫療紀錄，並可對資源執行刪除或恢復（soft-delete）。

Roles: Admin — 僅限 Admin（含分級）可存取此後台操作；針對敏感操作應要求更高等級且記錄 actor 與時間。

**Independent Test**: 管理員能在後台將 SUBMITTED 的送養標為 PUBLISHED 並檢視變更日誌；能為動物新增醫療紀錄；能恢復被標為 soft-deleted 的動物。

**Acceptance Scenarios**:

1. **Given**: 一筆送養為 SUBMITTED， **When**: 管理員審核通過， **Then**: 變更為 PUBLISHED，並在 audit log 中記錄操作人與時間。
2. **Given**: 管理員刪除一筆動物， **When**: 刪除， **Then**: 標記為 soft-deleted，並能在一定期限內恢復。

**Edge cases**:
- 審核中同時有多位管理員操作：後端需使用適當鎖定或版本控制以避免 race condition。
- 對於敏感資訊的操作需有更高權限提示且紀錄審計。

---

### User Story 7 - 我的申請與資料管理（Member self-service）(Priority: P2)

描述：會員可在個人頁面查看與管理自己提交的領養與送養申請，編輯可編輯的草稿、查看審核歷程、下載申請表、以及接收與查看通知紀錄（email/SMS）。如需直接聯絡，使用者將透過已核准或公開的聯絡資訊進行聯繫；平台於 MVP 階段不提供即時站內聊天功能。

Roles: Member, Owner, Shelter, Admin — Member 可管理個人申請（編輯/撤回/下載）且僅能存取自己的申請；Owner/Shelter 與 Admin 對其相關的申請可見摘要與執行審核權限（視權限）。

**Independent Test**: 會員登入後在「我的申請」看到所有歷史紀錄；可下載某筆申請的 PDF 摘要。

**Acceptance Scenarios**:

1. **Given**: 會員有多筆申請， **When**: 進入我的申請頁， **Then**: 列表按時間排序並可 filter（PENDING/APPROVED/REJECTED）。
2. **Given**: 某筆申請為 PENDING， **When**: 會員點選撤回， **Then**: 申請狀態變為 WITHDRAWN 並通知相關方。

**Edge cases**:
- 會員嘗試編輯已進入審核程序的申請：系統應阻止並提供替代操作（例如補件或聯絡送養者）。

---

### User Story 8 - 通知與通訊（email + SMS, Priority: P2）

描述：系統在申請狀態變更、審核結果或管理員操作時發送通知；會員可在個人設定選擇通知偏好（email、SMS）。

Roles: All registered roles (Member, Owner, Shelter, Admin) — 所有註冊使用者可設定通知偏好；系統會依偏好對事件發送 email 或 SMS。訪客不可設定偏好但在必要情況可透過 email/phone 被聯絡（若提供）。

**Independent Test**: 當管理員在後台將申請標記為 APPROVED，申請者在 1 分鐘內收到 email 通知（若偏好設為 email）。

**Acceptance Scenarios**:

1. **Given**: 申請狀態變更， **When**: 變更發生， **Then**: 系統排程發送通知（email/SMS）並記錄發送狀態。
2. **Given**: 使用者停用 email 通知， **When**: 事件發生， **Then**: 不寄送 email，而以 SMS（若設定）或忽略。

**Edge cases**:
- 郵件被退回或丟失：系統需有重試機制與失敗記錄。
- 通知頻率過高時應合併或節流（digests）。

---

<!-- Note: In this revision in-app direct messaging (previously User Story 9) has been removed. Direct messaging will be evaluated in a future sprint. Notifications in this spec are delivered via email/SMS. -->
---

### User Story 10 - 動物醫療紀錄管理 (Priority: P1)

描述：管理員、收容所工作人員與飼主皆可為動物新增、編輯或附加醫療紀錄（recordType、date、provider、details、attachments），但所有新增或修改的紀錄初始為 unverified 狀態；系統須保留審核歷程（verified, verifiedBy, verifiedAt）與變更日誌，管理員可驗證 (verify) 或拒絕該紀錄。醫療紀錄的摘要會在動物詳情頁展示，完整紀錄僅顯示給有權限的使用者或在經過審核後公開。

Roles: Owner, Shelter, Admin — Owner 與 Shelter（收容所操作人）可新增/更新其所屬動物的醫療紀錄（狀態初為 unverified）；Admin 負責 verify/reject 並保留審計紀錄；公眾僅見已驗證摘要。

**Why this priority**：醫療紀錄直接影響領養者對動物健康與適配性的判斷，為配對可靠性與平台信任的關鍵要素。

**Independent Test**：

- A. 飼主新增一則醫療紀錄並上傳附件，紀錄於系統顯示為 unverified 且出現在該動物的「待驗證醫療紀錄」清單中；管理員登入後能看到待驗證項目並執行 Verify 操作，Verify 後該紀錄於動物詳情摘要顯示為已驗證。

**Acceptance Scenarios**：

1. **Given**: 飼主為已驗證會員， **When**: 上傳某次疫苗紀錄並填寫 recordType、date、provider、details， **Then**: 系統建立 MedicalRecord (status: unverified)，並在 audit log 中記錄 actor 與 timestamp。
2. **Given**: 管理員在後台審核該紀錄， **When**: 點選 Verify， **Then**: 記錄變為 verified=true，verifiedBy=adminId，verifiedAt=時間，並觸發 email/SMS 通知給紀錄建立者。
3. **Given**: 未經驗證的醫療紀錄， **When**: 一般公眾檢視動物詳情， **Then**: 只顯示醫療紀錄摘要或遮罩關鍵詳細資訊；經驗證後，則顯示更完整內容。
4. **Given**: 上傳的附件格式或大小不符， **When**: 使用者上傳， **Then**: 前端阻擋上傳並顯示錯誤（允許的格式與最大大小限制在規格中說明）。

**Edge cases**：

- 若多方（飼主與收容所）針對同一事件上傳不同版本的醫療紀錄，系統需保留來源與時間戳並允許管理員合併或選擇可信版本。
- 當醫療紀錄被標記為欺詐或不實，管理員可標示為 disputed，並將該紀錄隱藏或加入調查流程；同時保留審計記錄以供追溯。
- 若紀錄被刪除或修改，系統應採 soft-delete 與版本控制（保留歷史版本以遵守審計要求）。

Mapping to FRs：此 user story 直接對應 **FR-008**（醫療紀錄的新增、檢視、更新與審核）與 **FR-007/FR-010**（審核歷程與個資保護）。

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統 MUST 允許使用者註冊、登入與登出，會員資料可在個人頁面檢視與更新（生日於首次註冊可選填，之後可補填）。
- **FR-002**: 系統 MUST 允許會員瀏覽「可領養動物」清單，並支援基本篩選（物種、年齡範圍、性別、縣市）與分頁顯示。
- **FR-003**: 系統 MUST 在動物詳情頁顯示：名稱、物種、年齡、性別、描述、圖片集（支援多張）、收容所或飼主資訊及醫療紀錄摘要（若有）。
- **FR-004**: 系統 MUST 允許會員針對動物提出領養申請，並在會員介面列出該會員的所有申請紀錄（含狀態、提交時間、審核時間、審核備註）。
- **FR-005**: 系統 MUST 允許會員發佈送養申請（包含至少一張圖片與描述等必填欄位），送養初始狀態為 SUBMITTED，等待管理員審核。
- **FR-006**: 系統 MUST 允許管理員在後台檢視/審核/更新/刪除動物資料與所有申請，並可為收容所新增動物資料。
- **FR-007**: 對於每筆領養申請，系統必須記錄完整的審核歷程（誰在何時將狀態變更為何，並能儲存審核備註）。
- **FR-008**: 系統 MUST 支援動物之醫療紀錄的新增、檢視與更新（治療、健檢、疫苗）。管理員、收容所工作人員與飼主皆可新增或編輯醫療紀錄，但所有新增或修改的紀錄須包含審核標記（verified: boolean）並保留審核歷程（verifiedBy、verifiedAt）。建議必填欄位：recordType、date、provider、details；可接受附件 attachments（例如醫療證明照片）。
- **FR-009**: 系統 MUST 支援通知機制（例如：申請狀態變更、審核結果、管理員通知），通知型式以 email 與 SMS 為主要選項，使用者可在偏好設定中選擇優先通道；MVP 預設為 email。平台在 MVP 階段不包含即時站內聊天（in-app messaging）；如需此功能將於後續版本評估與排期。

*安全與隱私相關（非實作細節）*

- **FR-010**: 系統 MUST 對會員個資（email、電話、身份資訊）採最低必要原則儲存，並提供管理員與使用者能夠查詢與匯出其個人資料之申請紀錄（符合法規要求）。

### Key Entities *(include if feature involves data)*

- **Member**: 識別使用者帳號與基本資料（username, email, phoneNumber, firstName, lastName, role[member|owner|admin], profile fields）。
- **Animal**: 動物項目（id, name, species[CAT|DOG], age, sex, description, images[], status[PUBLISHED|SUBMITTED|RETIRED], shelterId?, ownerId?）。
- **Application**: 領養/送養申請（id, applicantId, animalId, type[ADOPTION|REHOME], status[PENDING|UNDER_REVIEW|APPROVED|REJECTED], submittedAt, reviewedAt, reviewNotes, assigneeId）。
- **Shelter**: 收容所資訊（id, name, contact, address）。
- **MedicalRecord**: 動物醫療紀錄（id, animalId, recordType[TREATMENT|CHECKUP|VACCINE], date, details, provider, notes）。
- **AuditLog**: 事件紀錄（actorId, action, targetType, targetId, timestamp, details）—用於追蹤審核歷程與資料變更。

## Execution Flows for Functional Requirements

為每個 Functional Requirement 提供可執行的流程藍圖（Preconditions, Steps, Postconditions, Error handling, API example）。開發者與 QA 可直接將其轉換為 API contract 與測試腳本。

FR-001: 使用者註冊 / 登入 / 登出
- Preconditions: 無；email 必須唯一。
- Steps (註冊): 1) POST /auth/register {email,password,username} 2) server 驗證輸入並建立未驗證帳號 3) server 發送驗證信 4) 使用者點驗證連結 => GET /auth/verify?token=... => 帳號狀態 = VERIFIED。
- Steps (登入): 1) POST /auth/login {email,password} 2) server 驗證憑證 3) 回傳 access token + refresh token。
- Postconditions: 已驗證會員可使用受限功能（發佈送養、提交申請）。
- Error handling: 重複 email => 409；格式錯誤 => 400；憑證錯誤 => 401。
- API example: POST /auth/register, POST /auth/login, POST /auth/logout (invalidate token)

FR-002: 瀏覽可領養動物清單（篩選 / 分頁）
- Preconditions: 有 PUBLISHED 的 animal 資料。
- Steps: 1) GET /animals?species=DOG&city=Taipei&page=1&size=20 2) server 回傳 items + pagination metadata 3) client render。
- Postconditions: 列表與分頁顯示正確。
- Error handling: 不合法參數 => 400；超大 page size => 413 或自動調整回最大值。
- API example: GET /animals

FR-003: 動物詳情（含圖片集與醫療紀錄摘要）
- Preconditions: animalId 存在，且請求者有權查看（公開或已授權）。
- Steps: 1) GET /animals/{id} 2) server 回傳 animal + images[] + medicalRecordSummaries[] 3) client 顯示詳情與圖片檢視器。
- Postconditions: 使用者能查看詳情並觸發下一步（提出申請）。
- Error handling: animal 不存在 => 404；存取被拒 => 403；圖片載入錯誤以 placeholder 顯示。
- API example: GET /animals/{id}

FR-004: 提出領養申請
- Preconditions: requestor 為已登入會員，animal 可申請狀態（PUBLISHED）。
- Steps: 1) GET 詳情顯示表單 2) POST /applications {applicantId,animalId,answers,attachments?} 3) server 建立 application {status:PENDING,submittedAt} 並通知 owner/admin。
- Postconditions: 申請顯示於會員「我的申請」；觸發審核工作項。
- Error handling: 欄位驗證失敗 => 400；重複申請（相同 applicantId+animalId 且未結案） => 409。
- API example: POST /applications

FR-005: 發佈送養（飼主）
- Preconditions: 使用者為已驗證會員並擁有 owner 權限或想要發佈的 animal 資料。
- Steps: 1) POST /rehomes {ownerId,animal:{...},images[],medicalSummary} 2) server 建立 record status=SUBMITTED 3) 通知管理員待審核。
- Postconditions: 飼主看到 SUBMITTED；管理員在後台處理。
- Error handling: 圖片上傳失敗 => 422；少必填欄位 => 400。
- API example: POST /rehomes

FR-006: 管理員檢視 / 審核 / 更新 / 刪除
- Preconditions: requestor role = admin。
- Steps (審核): 1) GET /admin/rehomes?status=SUBMITTED 2) admin GET /admin/rehomes/{id} 3) POST /admin/rehomes/{id}/review {action: APPROVE|REJECT,notes} 4) server 更新狀態、寫入 auditLog、通知相關方。
- Steps (刪除): DELETE /admin/animals/{id} => soft-delete 並記錄 audit。
- Postconditions: 變更反映前台，auditLog 可查。
- Error handling: 權限不足 => 403；版本衝突 => 409。
- API example: POST /admin/rehomes/{id}/review, DELETE /admin/animals/{id}

FR-007: 記錄完整審核歷程（Audit）
- Preconditions: 所有改變申請與動物狀態的操作均會觸發 audit entry。
- Steps: 在每個狀態變更的 API 中，同步或透過可靠隊列寫入 AuditLog {actorId,action,targetType,targetId,before,after,timestamp}；提供 GET /admin/audit?targetType=application&targetId=...
- Postconditions: audit 可查且不可被普通帳號刪除。
- Error handling: 若寫入失敗，將事件入 queue 並回傳 202（接受但延後處理）。
- API example: GET /admin/audit?targetType=...

FR-008: 動物醫療紀錄的新增 / 檢視 / 更新 / 審核
- Preconditions: requestor role in (admin,shelter,owner) 可新增；公眾僅可查看已驗證摘要。
- Steps (新增): POST /animals/{id}/medical-records {recordType,date,provider,details,attachments?} => 建立 status=unverified 並記 audit；管理員於 /admin/medical-records 審核並 POST /medical-records/{id}/verify {verified:true|false,notes}
- Postconditions: verified=true 的紀錄顯示於詳情摘要；unverified 僅出現在待驗證清單。
- Error handling: 附件格式/大小錯誤 => 422；衝突/重複 => 409。
- API example: POST /animals/{id}/medical-records, POST /medical-records/{id}/verify

FR-009: 通知機制（email + SMS）
- Preconditions: 使用者有通知偏好設定（預設 email）。
- Steps: 1) 事件觸發（application status change 等）2) server push event to notification queue 3) worker 發送 email 或 SMS（外部 provider） 4) 更新通知狀態並重試失敗項目。
- Postconditions: 系統記錄發送結果並支援 retry 與 failure logging；若實作通知中心，應保留發送狀態記錄。
- Error handling: 外部 provider 失敗回傳 502/503 => 依重試策略處理並在超過次數後記錄 failed。
- API example: GET /notifications, POST /notifications/{id}/mark-read

FR-010: 個資保護與查詢/匯出（Data Privacy）
- Preconditions: 使用者為 data owner 或 admin；需通過驗證流程。
- Steps (匯出): POST /data/export {userId,requesterId} => server 驗證權限、生成資料包（含申請紀錄、個資），並提供下載連結（暫時可用於 24hr）。
- Steps (刪除): POST /data/delete {userId,requesterId} => server 執行資料匿名化或刪除流程，並記錄於 auditLog；如涉及備份，標記待清理或列入刪除政策。
- Postconditions: 匯出檔案可供下載；刪除請求後主要可見資料被移除或匿名化；audit 記錄保存。
- Error handling: 權限不足 => 403；長時間作業建議回傳 202 並提供查詢 job status 的 endpoint（GET /jobs/{id}）。
- API example: POST /data/export, POST /data/delete, GET /jobs/{id}
