# Use Case 圖與說明（中文翻譯） — 貓狗領養平台

此檔為 `use-cases.md` 中 UC-01..UC-13 展開段落的中文翻譯（保留 API 路徑與程式碼片段不變）。

## UC-01: 瀏覽動物列表 (Browse Listings)
主要參與者：Visitor / GENERAL_MEMBER
利害關係人：瀏覽者 (Browsers)、平台 (Platform)、動物刊登者 (Animal Owners)
前置條件：資料庫包含至少一筆 PUBLISHED 動物或相關刊登；已套用公開刊登可見性規則。
觸發條件：使用者開啟刊登頁或執行搜尋/篩選動作。

主要成功情境：
1. 客戶端請求 GET /animals?filters... (page,size,q,species,city,...)。
2. 伺服器驗證查詢參數並套用權限過濾。
3. 伺服器使用索引查詢資料庫並回傳分頁結果，包含最小化的動物卡片資料 (id,name,species,thumbnail,status)。
4. 客戶端呈現列表並支援分頁或無限滾動以檢視更多結果。

替代流程 / 例外情境：
- A1: 查詢參數無效 -> 400 並回傳驗證細節。
- A2: 分頁超出可用結果範圍 -> 200，items 為空且回傳 metadata (page,size,total=...)。
- A3: 資料庫超時 -> 503 / Retry-After。

後置條件：使用者看到符合篩選條件的正確分頁動物列表。

驗收準則：
- GET /animals 回傳 200 並包含分頁 metadata (page,size,total)。
- 伺服器在正常負載下 P95 回應時間應小於 500ms（NFR 目標）。

API 備註：建議在 (status,species,city,createdAt) 上建立索引，並對 name/description 建立全文索引。

---

## UC-02: 查看動物細節 (View Listing Details)
主要參與者：Visitor / GENERAL_MEMBER
利害關係人：Applicant、Owner、平台
前置條件：animalId 存在；對該請求者已通過可見性/發布檢查。
觸發條件：使用者點選動物卡片或導向 /animals/{id}。

主要成功情境：
1. 客戶端請求 GET /animals/{id}。
2. 伺服器驗證可見性並取得 animal、圖片（限制 N 張）、最近的 medicalSummary、以及 shelter/owner 的公開資訊。
3. 伺服器回傳 200，包含詳細 payload（images 陣列、medicalSummaries（除非授權，僅回傳已驗證的摘要）、聯絡/公開資訊）。
4. 客戶端顯示詳情頁，包含圖片、metadata 與適用時的 CTA（申請）。

替代流程：
- A1: 找不到 animal 或已刪除 -> 404。
- A2: 無權查看受限細節 -> 200，但欄位遮罩並說明需驗證的要求。
- A3: 圖片遺失 -> 回傳佔位 metadata；客戶端顯示預設圖片。

後置條件：詳情頁已渲染；若使用者為 GENERAL_MEMBER 且 animal.status == PUBLISHED，則顯示申請 CTA。

驗收準則：
- GET /animals/{id} 回傳必要欄位，且對未授權使用者不提供敏感資訊。
- 圖片以預簽 URL 載入；缺圖情況能妥善處理。

API 備註：考慮針對高頻讀取端點做快取（edge cache / CDN，針對圖片與縮圖）。

---

## UC-03: 註冊 / 登入 (Register / Login)
主要參與者：Visitor
利害關係人：使用者、平台（auth）、Admin
前置條件：註冊無需前置；登入需有既存且已驗證的帳號。
觸發條件：Visitor 提交註冊或登入表單。

主要成功情境（註冊）：
1. 客戶端 POST /auth/register {email,password,username}。
2. 伺服器驗證輸入、建立 User (role=GENERAL_MEMBER)、寫入 AuditLog、排入驗證 Email 工作，並回傳 201 含 id 與 verificationSent 標記。
3. 使用者收到驗證信（外部傳送為延後處理）並透過 GET /auth/verify?token=... 完成驗證。

主要成功情境（登入）：
1. 客戶端 POST /auth/login {email,password}。
2. 伺服器驗證憑證、發行 accessToken + refreshToken，回傳 200。

替代流程：
- A1: 註冊時 email 重複 -> 409。
- A2: 登入憑證錯誤 -> 401。
- A3: 連續失敗嘗試觸發速率限制 -> 429，並可能啟動鎖定規則。

後置條件：已建立（未驗證）註冊使用者或使用者已取得驗證 token。

驗收準則：
- 註冊回傳 201 並排入驗證；登入成功則回傳 token。

API 備註：使用 bcrypt 或 argon2 做密碼雜湊，並限制登入嘗試次數（速率限制 / 帳號鎖定）。

---

## UC-04: 建立動物刊登 (Create Listing)
主要參與者：GENERAL_MEMBER 或 SHELTER_MEMBER
利害關係人：Owner/Publisher、平台、Admin
前置條件：參與者已驗證身份；若以 SHELTER_MEMBER 身份建立，該帳號須為 shelter 的 primaryAccountUser。
觸發條件：使用者填寫刊登表單並提交。

主要成功情境：
1. 客戶端 POST /rehomes {animal payload, images refs, medicalSummary, attachments?}，可選帶上 Idempotency-Key。
2. 伺服器驗證 payload、儲存 metadata、建立 Animal 紀錄（status=SUBMITTED）、寫入 AuditLog、排入圖片處理工作，並回傳 201 含 id/status。
3. Admin 收到審核通知；刊登者在「我的刊登」中看到該紀錄。

替代流程：
- A1: 缺少必要欄位 -> 400。
- A2: 圖片處理失敗 -> 202 Accepted 並回傳 jobId；紀錄已建立但圖片尚未完成處理。
- A3: 使用相同 Idempotency-Key 重複提交 -> 根據 idempotency 政策回傳既有資源或 409。

後置條件：Animal 紀錄建立，狀態為 SUBMITTED 等待審核。

驗收準則：
- POST /rehomes 回傳 201 並包含資源 id；圖片以非同步方式處理並提供工作追蹤。

API 備註：支援為建立端點傳入 Idempotency-Key；伺服器端需驗證 owner/shelter 的權限。

---

## UC-05: 編輯 / 刪除刊登 (Edit / Delete Listing)
主要參與者：GENERAL_MEMBER（owner）或 SHELTER_MEMBER 或 ADMIN
利害關係人：刊登者/所有者、申請人、Admin
前置條件：參與者已驗證且有權限修改該 Animal 紀錄（ownerId、shelterId 或 admin）。
觸發條件：參與者提交更新或刪除操作。

主要成功情境（編輯）：
1. 客戶端 PATCH /animals/{id} {fields... , expectedVersion?}。
2. 伺服器驗證授權與 expectedVersion（樂觀鎖定）。
3. 伺服器更新紀錄、版本遞增、寫入 AuditLog，並回傳 200 含更新後資源。

主要成功情境（刪除/軟刪除）：
1. 客戶端 DELETE /animals/{id}。
2. 伺服器標記 deletedAt 時間戳（軟刪除）、寫入 AuditLog、通知正在處理中的申請人，並回傳 200。

替代流程：
- A1: 未授權 -> 403。
- A2: 版本衝突 -> 409 並回傳 currentVersion。
- A3: 於有進行中的核准領養流程下刪除 -> 根據政策阻止或需 admin 確認。

---

## UC-06: 上傳圖片與附件 (Upload Images/Attachments)
主要參與者：GENERAL_MEMBER / SHELTER_MEMBER
利害關係人：刊登者、平台、儲存服務供應商
前置條件：參與者已驗證；客戶端有二進位檔案；若採用 direct-to-storage，需可取得 presigned upload 授權。
觸發條件：使用者在刊登/編輯流程中上傳圖片或附件。

主要成功情境：
1. 客戶端透過 POST /uploads/presign {filename,mimeType,size} 請求 presign，或透過 POST /uploads 以 API 方式上傳。
2. 伺服器回傳 presigned URL 或接受二進位資料並存到物件存儲；伺服器記錄 storageKey metadata。
3. 客戶端（或伺服器）確認上傳完成後，伺服器建立 Attachment 紀錄（包含 ownerType/ownerId 或暫存關聯）並回傳 201。

替代流程：
- A1: 檔案超出大小/格式限制 -> 413/422 並回傳驗證訊息。
- A2: presigned URL 過期 -> 400/403；客戶端重新取得 presign 並重試。
- A3: 儲存服務供應商短暫性錯誤 -> 502/503 並提供重試指引。

後置條件：Attachment 紀錄存在並包含 storageKey，可用於關聯至 animal/application/medical record。

驗收準則：
- Presign 流程提供短時效 URL；Attachment metadata 已持久化且可查詢。

API 備註：儲存 mimeType 與 size；考慮在上傳流程加入病毒掃描與內容審查管線。

---

## UC-07: 送出領養申請 (Submit Application)
主要參與者：GENERAL_MEMBER
利害關係人：Applicant、Owner (GENERAL_MEMBER or SHELTER_MEMBER)、Admin
前置條件：Applicant 已驗證；animal.status == PUBLISHED；Applicant 不是該動物的所有者。
觸發條件：Applicant 在動物詳情頁提交申請表單。

主要成功情境：
1. 客戶端 POST /applications，body 包含 {animalId,answers,attachmentIds?}，並可選附上 Idempotency-Key 標頭。
2. 伺服器驗證申請資格、檢查 idempotency、建立 Application (status=PENDING, version=1)、寫入 AuditLog、建立通知記錄給 owner 與 admin，並回傳 201 含 application id。
3. Applicant 在 "我的申請" 中看到該申請；owner/admin 在 Notification Center 中看到通知。

替代流程：
- A1: 已有重複未結案申請 -> 409 或依 UX 規則回傳既有申請。
- A2: 參考的附件無效 -> 422。
- A3: Idempotency-Key 被重複使用但 payload 不同 -> 409 並回傳診斷資訊。

後置條件：Application 已持久化；通知已排入；外部傳送（若有）為延後排程。

驗收準則：
- POST /applications 回傳 201，申請可被申請人與擁有者查詢。

API 備註：強制執行 idempotency-key 的唯一性與 TTL；驗證 applicant != owner。

---

## UC-08: 審核申請 (Review Application)
主要參與者：GENERAL_MEMBER（owner）或 SHELTER_MEMBER 或 ADMIN
利害關係人：Applicant、Owner、Admin
前置條件：參與者已驗證且有權限；application 存在且處於可審核狀態。
觸發條件：審核者選擇申請並觸發審核操作。

主要成功情境：
1. 客戶端 POST /applications/{id}/review {action,notes,assigneeId?,expectedVersion?}。
2. 伺服器驗證權限與 expectedVersion；更新 application.status 與/或 assignee，版本遞增，寫入 AuditLog，建立通知記錄，並回傳 200 含更新後資源。

替代流程：
- A1: expectedVersion 不符 -> 409 並回傳 currentVersion。
- A2: 審核者未授權 -> 403。
- A3: 非法的狀態轉換 -> 400。

後置條件：Application 狀態已更新；AuditLog 與通知已紀錄。

驗收準則：
- 審核端點強制樂觀鎖定；狀態轉換被記錄並通知利害關係人。

API 備註：在回應中提供 currentVersion 以協助 UI 維持樂觀鎖定。

---

## UC-09: 管理醫療紀錄 (Add/Edit Medical Record)
主要參與者：GENERAL_MEMBER（owner）、SHELTER_MEMBER、ADMIN
利害關係人：動物紀錄、申請人、Admin
前置條件：參與者已驗證且對該動物有授權。
觸發條件：參與者提交新的醫療紀錄或編輯現有紀錄。

主要成功情境（建立）：
1. 客戶端 POST /animals/{id}/medical-records {recordType,date,provider,details,attachmentIds?}。
2. 伺服器建立 MedicalRecord (verified=false)、寫入 AuditLog、排入 admin 驗證通知，並回傳 201。

替代流程：
- A1: 附件無效 -> 422。
- A2: 未授權 -> 403。

後置條件：MedicalRecord 已持久化並在驗證前顯示為未驗證狀態。

驗收準則：
- 醫療紀錄建立回傳 201 並出現在 admin 的佇列中。

API 備註：附件保留為 Attachment 紀錄的引用。

---

## UC-10: 驗證醫療紀錄 (Verify Medical Record)
主要參與者：ADMIN（或 Verifier）
利害關係人：Owner、Applicant、Admin
前置條件：MedicalRecord 存在且 verified==false；參與者有授權。
觸發條件：Admin 觸發驗證操作。

主要成功情境：
1. 客戶端 POST /medical-records/{id}/verify {verified:true|false,notes}
2. 伺服器更新紀錄（verified,verifiedBy,verifiedAt）、寫入 AuditLog、通知建立者，並回傳 200。

替代流程：
- A1: 已驗證 -> 根據實作回傳 409 或 200（具有冪等性）。
- A2: 未授權 -> 403。

後置條件：MedicalRecord 被標記為已驗證（true/false）並相應顯示。

驗收準則：
- 驗證操作會更新紀錄並產生 AuditLog 與通知。

API 備註：保留變更歷史以供稽核（版本化或 Audit 條目）。

---

## UC-11: 站內即時訊息 (In-app Messaging) — Deferred
主要參與者：(未來) GENERAL_MEMBER
利害關係人：使用者
前置條件：MVP 不包含此功能；設計已記錄以供未來實作。
觸發條件：MVP 無。

主要成功情境（未來）：
1. 客戶端開啟對話並傳送訊息給參與者。
2. 伺服器持久化 Message 與 Conversation 關聯，排入通知記錄給收件者，並回傳 201。

備註：此功能明確被延後至 MVP 之外。若日後需要，建議以 Conversation + Message 表格建模，participants 作為關聯，並支援 soft-delete 與即時傳送（WebSocket / Push）。

---

## UC-12: 收到通知 (Receive Notifications)
主要參與者：GENERAL_MEMBER / SHELTER_MEMBER / ADMIN
利害關係人：所有使用者、平台
前置條件：系統事件產生 Notification 紀錄。
觸發條件：客戶端輪詢或訂閱 Notification feed（GET /notifications 或 websocket）。

主要成功情境：
1. 客戶端 GET /notifications?recipientId={me}&unreadOnly=true 或透過 websocket 接收新通知事件。
2. 伺服器回傳近期通知清單，包含 payload、read flag、createdAt 與投遞 metadata。
3. 客戶端透過 POST /notifications/{id}/mark-read 標記已讀；伺服器更新 read flag 並寫入 AuditLog。

替代流程：
- A1: 傳送外部通道的工作失敗 -> Notification.externalDeliveryStatus 顯示 FAILED；UI 顯示提示。

後置條件：使用者看到通知；已讀狀態已持久化。

驗收準則：
- GET /notifications 回傳近期項目並支援分頁與按已讀/未讀篩選。

API 備註：MVP 優先輪詢；日後可新增 websocket/Push 功能。

---

## UC-13: 管理後台與報告 (Admin Dashboard & Reports)
主要參與者：ADMIN
利害關係人：Admin、平台擁有者
前置條件：Admin 已驗證並具足夠權限。
觸發條件：Admin 導向 dashboard 或請求報表。

主要成功情境：
1. 客戶端 GET /admin/dashboard 或請求特定報表端點（jobs, audit, metrics）。
2. 伺服器驗證 admin 範圍並回傳彙總指標（按狀態計數、佇列長度、近期失敗、關鍵 KPI）及可分頁的資源以供鑽取分析。
3. Admin 可根據權限採取操作（重新執行 job、標注紀錄、匯出資料）；所有操作皆被記錄於 AuditLog。

替代流程：
- A1: 權限不足 -> 403。
- A2: 大型匯出請求 -> 202 並回傳 jobId 與就緒後的可下載連結。

後置條件：Admin 取得指標並能對可操作項目採取行動。

驗收準則：
- Dashboard 端點回傳準確彙總 KPI；匯出為 job 模式且可追蹤。

API 備註：保護 admin 端點並採用 job pattern 與角色基礎存取控制來節流與匯出。

---

文件來源：`specs/002-title-description-project/use-cases.md`（英文原檔）。

如果你想要我把中文檔案加入 repo 並建立 PR，或將它放到 README 中，告訴我下一步。 
