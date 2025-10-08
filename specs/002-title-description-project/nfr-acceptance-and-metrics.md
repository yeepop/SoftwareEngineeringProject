# NFR Acceptance Tests & Monitoring Metrics

此文件將 Non-Functional Requirements（NFR）轉為可執行的 acceptance tests 與建議的 Prometheus/Grafana 指標與 Alert 規則，方便 QA/SRE 實作負載測試、監控與警示。

---

## 1) Performance - Acceptance Tests

- Test P1: API latency (p95 / p99)
  - 目的：驗證 API 延遲符合目標
  - 步驟：使用負載工具（k6/JMeter）模擬正常負載（例如 200 RPS 或代表性使用者行為），執行 30 分鐘。
  - 觀察指標：http_request_duration_seconds histogram 的 p95 與 p99
  - 預期：p95 < 1s，p99 < 2s；失敗視為未通過

- Test P2: 首次頁面載入時間
  - 目的：確認首頁或列表頁在典型條件下快速呈現
  - 步驟：使用 WebPageTest / Puppeteer 測量真實瀏覽器下的 First Contentful Paint 與 DOMContentLoaded，在代表性網路條件 (3G/4G/光纖) 下各執行 50 次。
  - 預期：FCP / DOMContentLoaded p95 < 2s

- Test P3: Concurrent users baseline
  - 目的：系統在指定並發使用者數量下不退化
  - 步驟：模擬 1,000 concurrent users（代表性工作流程：瀏覽列表 → 進入詳情 → 提出申請），觀察錯誤率與延遲 15 分鐘。
  - 預期：API 5xx < 1%，關鍵任務成功率 ≥ 99%，CPU/Memory 不超過可接受閾值（由 SRE 定義）

## 2) Availability & SLA - Acceptance Tests

- Test A1: Uptime monitoring
  - 目的：驗證系統可用率達 99.9%
  - 步驟：透過外部可用性檢查（Pingdom/uptimerobot）觀察 30 天的可用性數據。
  - 預期：30 天可用率 ≥ 99.9%

- Test A2: Planned maintenance handling
  - 目的：驗證系統在計畫性維護期間能正確通知並在窗口內恢復
  - 步驟：模擬一次短期維護事件並驗證通知流程與恢復時間（RTO）
  - 預期：RTO ≤ 4 小時（參照 Backup/DR）

## 3) Reliability & Error Rates - Acceptance Tests

- Test R1: API error rate
  - 步驟：在負載測試期間檢查 5xx error count
  - 預期：5xx / total_requests < 1%

- Test R2: Key user flow success
  - 目的：確認關鍵任務（提交申請、上傳圖片、審核）成功率
  - 步驟：模擬 500 個完整申請提交流程並記錄成功/失敗
  - 預期：關鍵任務成功率 ≥ 99%

## 4) Data Retention & Privacy - Acceptance Tests

- Test D1: Data export & deletion
  - 步驟：建立測試帳號、上傳個資與醫療附件，執行資料匯出（export）與刪除（delete）流程，確認匯出檔案內容並確認資料在系統中被移除或匿名化。
  - 預期：匯出檔案包含必要欄位；刪除後嘗試存取個資應被拒絕；備份中若保存舊版本，需有相應刪除流程或政策說明。

- Test D2: Medical record retention
  - 目的：驗證醫療紀錄保留策略（預設建議 7 年）可執行
  - 步驟：選取過期模擬資料，執行 retention policy 刪除流程，並確認審計記錄
  - 預期：過期資料被標記/刪除且保有審計紀錄

## 5) Backup & Disaster Recovery - Acceptance Tests

- Test B1: Daily backup verification
  - 步驟：檢查每天備份成功指標（backup_success_total），並在備份系統產生的備份檔執行完整性檢查（restore 流程的 dry-run）。
  - 預期：每日備份成功率 100%（或指定閾值），最近一次備份可用於恢復

- Test B2: Restore drill
  - 步驟：執行一次從最新備份到隔離環境的完整 restore，驗證應用程式啟動與基本功能
  - 預期：能在 RTO ≤ 4 小時、RPO ≤ 1 小時 的目標下完成 restore

## 6) Security - Acceptance Tests

- Test S1: TLS & transport security
  - 步驟：使用 SSL Labs 或自動化掃描器驗證 TLS 配置（TLS 1.2+、無弱 cipher）
  - 預期：A 等級或更好

- Test S2: Password policy & auth
  - 步驟：檢查密碼長度與強度驗證；測試登入嘗試限制（rate limiting）與 2FA flows（如果啟用）
  - 預期：密碼策略生效，暴力攻擊被速率限制阻止

- Test S3: Audit logs
  - 步驟：觸發管理員級操作（審核、刪除），驗證 audit log 存在且包含 actorId, action, targetId, timestamp
  - 預期：操作均被紀錄，且無法被普通帳號刪除

## 7) Monitoring, Alerts & Observability

- Test M1: Alerting
  - 步驟：觸發模擬錯誤（例如：暫時製造 5xx），確認 alert 規則觸發並通知至指定頻道（PagerDuty/Slack）
  - 預期：Alert 在 SLA 閾值內觸發且通知成功

---

# Prometheus Metric Names & Grafana Dashboard Suggestions

以下為建議的 Prometheus 指標命名（使用常見慣例），以及對應 Grafana 面板與範例 Alert 規則。指標請由後端/前端/infra 團隊在程式與 exporter 中實作。

## Suggested Prometheus metrics (examples)

- http_request_duration_seconds_bucket{handler,method,code}
- http_request_duration_seconds_sum / _count (標準 Histogram)
- http_requests_total{handler,method,code}
- http_request_errors_total{handler,method,code}
- api_5xx_total
- api_4xx_total
- upload_failure_total{reason}
- notification_failure_total{channel} // email/in-app/sms
- keyflow_success_total{flow} // e.g., flow="submit_application"
- keyflow_attempt_total{flow}
- concurrent_users_gauge
- active_sessions_total
- backup_success_total
- backup_last_success_timestamp
- backup_size_bytes
- db_replica_lag_seconds
- background_jobs_queue_depth{queue}
- worker_job_failures_total{worker}
- disk_usage_bytes{mount}
- cpu_usage_seconds_total (per instance)
- memory_usage_bytes (per instance)
- audit_log_events_total
- medical_record_verifications_total{status} // status=unverified/verified/disputed

## Grafana Dashboard panels (suggested)

1. Overview (single row)
   - API Traffic (http_requests_total by handler)
   - API Latency p50/p95/p99 (derived from histogram)
   - Error Rate (5xx / total) with threshold line at 1%
   - Active Users / Sessions
   - Background queue depth

2. Key Flows (one panel per flow)
   - Submit application success rate = keyflow_success_total / keyflow_attempt_total
   - Upload success/failure trend

3. Storage & Backup
   - Backup success rate and last backup timestamp
   - Disk usage trends

4. Infrastructure
   - CPU / Memory per instance
   - DB replica lag

5. Security & Audit
   - Admin actions per hour (audit_log_events_total)
   - Suspicious events (e.g., multiple failed logins)

## Example Alert Rules (Prometheus-style, values are examples)

- High API error rate
  - expr: increase(api_5xx_total[5m]) / increase(http_requests_total[5m]) > 0.01
  - for: 2m
  - severity: critical

- High latency (p95)
  - expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, handler)) > 1
  - for: 5m
  - severity: warning

- Background queue growth
  - expr: max(background_jobs_queue_depth) by (queue) > 50
  - for: 10m
  - severity: warning

- Backup failure
  - expr: increase(backup_success_total[24h]) == 0
  - for: 1h
  - severity: critical

- DB replica lag
  - expr: max(db_replica_lag_seconds) > 30
  - for: 5m
  - severity: warning

- Notification failures
  - expr: increase(notification_failure_total[15m]) > 10
  - severity: warning

## Implementation notes for engineers

- Instrumentation: 使用現成的 metrics middleware（如 express-prom-bundle 或 python client）並標記 handler/route 名稱，保證 http_request_seconds 指標覆蓋所有 API。
- Frontend RUM: 可使用 Real User Monitoring（例如 Sentry/RUM、Lighthouse CI）收集 FCP/LCP 並推送 summary 指標到 Prometheus（或使用專門 RUM 平台）。
- Alerts: 把告警發送到 Slack + PagerDuty，並在運維 runbook 中加入應對步驟。
- Dashboards: 先建立 Overview 與 Key Flow 面板，後續逐步擴充到 Storage/Infra/Security 分頁。

---

## Files created / next steps

- 建議把本文件存檔為 `specs/002-title-description-project/nfr-acceptance-and-metrics.md`（已生成）。
- 我可以：
  - 1) 生成 Prometheus alert rules YAML（基礎版）
  - 2) 產出 Grafana dashboard JSON（初始 Overview 面板）
  - 3) 把 acceptance tests 轉為 QA 可跑的 k6 腳本樣板

請回覆要我先執行哪一項（1/2/3），或告訴我需要調整的指標或閾值。