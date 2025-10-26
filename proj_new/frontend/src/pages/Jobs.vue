<template>
  <div class="jobs-page">
    <div class="container">
      <!-- 頁面標題 -->
      <div class="page-header">
        <h1 class="page-title">任務狀態</h1>
        <p class="page-description">查看背景任務執行狀態</p>
      </div>

      <!-- 狀態篩選標籤 -->
      <div class="status-tabs">
        <button 
          @click="filterStatus = null"
          :class="['tab', { active: filterStatus === null }]"
        >
          全部 ({{ totalCount }})
        </button>
        <button 
          @click="filterStatus = 'PENDING'"
          :class="['tab', { active: filterStatus === 'PENDING' }]"
        >
          待處理 ({{ statusCounts.PENDING || 0 }})
        </button>
        <button 
          @click="filterStatus = 'RUNNING'"
          :class="['tab', { active: filterStatus === 'RUNNING' }]"
        >
          執行中 ({{ statusCounts.RUNNING || 0 }})
        </button>
        <button 
          @click="filterStatus = 'SUCCEEDED'"
          :class="['tab', { active: filterStatus === 'SUCCEEDED' }]"
        >
          已完成 ({{ statusCounts.SUCCEEDED || 0 }})
        </button>
        <button 
          @click="filterStatus = 'FAILED'"
          :class="['tab', { active: filterStatus === 'FAILED' }]"
        >
          失敗 ({{ statusCounts.FAILED || 0 }})
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading && jobs.length === 0" class="loading-container">
        <div class="spinner"></div>
        <p>載入中...</p>
      </div>

      <!-- 空狀態 -->
      <div v-else-if="jobs.length === 0" class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="empty-text">目前沒有任務</p>
      </div>

      <!-- 任務列表 -->
      <div v-else class="jobs-list">
        <div v-for="job in jobs" :key="job.job_id" class="job-card">
          <!-- 卡片頭部 -->
          <div class="job-header">
            <div class="job-info">
              <h3 class="job-type">{{ getJobTypeLabel(job.type) }}</h3>
              <p class="job-id">任務 #{{ job.job_id }}</p>
            </div>
            <div :class="['status-badge', getStatusClass(job.status)]">
              {{ getStatusLabel(job.status) }}
            </div>
          </div>

          <!-- 進度條 (僅顯示執行中的任務) -->
          <div v-if="job.status === 'RUNNING'" class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: getProgress(job) + '%' }"></div>
            </div>
            <span class="progress-text">{{ getProgress(job) }}%</span>
          </div>

          <!-- 任務詳情 -->
          <div class="job-details">
            <div class="detail-item">
              <span class="detail-label">建立時間:</span>
              <span class="detail-value">{{ formatDateTime(job.created_at) }}</span>
            </div>
            <div v-if="job.started_at" class="detail-item">
              <span class="detail-label">開始時間:</span>
              <span class="detail-value">{{ formatDateTime(job.started_at) }}</span>
            </div>
            <div v-if="job.completed_at" class="detail-item">
              <span class="detail-label">完成時間:</span>
              <span class="detail-value">{{ formatDateTime(job.completed_at) }}</span>
            </div>
            <div v-if="job.error" class="detail-item">
              <span class="detail-label">錯誤訊息:</span>
              <span class="detail-value error-text">{{ job.error }}</span>
            </div>
          </div>

          <!-- 操作按鈕 -->
          <div class="job-actions">
            <button 
              v-if="job.status === 'FAILED'" 
              @click="handleRetry(job.job_id)"
              class="btn-retry"
              :disabled="retryingJobs.has(job.job_id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ retryingJobs.has(job.job_id) ? '重試中...' : '重試' }}
            </button>
            <button 
              v-if="['PENDING', 'RUNNING'].includes(job.status)" 
              @click="handleCancel(job.job_id)"
              class="btn-cancel"
              :disabled="cancelingJobs.has(job.job_id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{ cancelingJobs.has(job.job_id) ? '取消中...' : '取消' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 自動刷新指示器 -->
      <div v-if="jobs.length > 0" class="auto-refresh-indicator">
        <svg class="refresh-icon" :class="{ spinning: loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>每 5 秒自動更新</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { getJobs, retryJob, cancelJob } from '@/api/jobs'
import type { Job } from '@/types/models'

const jobs = ref<Job[]>([])
const loading = ref(false)
const filterStatus = ref<string | null>(null)
const retryingJobs = ref(new Set<number>())
const cancelingJobs = ref(new Set<number>())
let pollInterval: number | null = null

// 計算各狀態數量
const statusCounts = computed(() => {
  const counts: Record<string, number> = {
    PENDING: 0,
    RUNNING: 0,
    SUCCEEDED: 0,
    FAILED: 0
  }
  jobs.value.forEach(job => {
    if (counts[job.status] !== undefined) {
      counts[job.status]++
    }
  })
  return counts
})

const totalCount = computed(() => jobs.value.length)

// 載入任務列表
async function loadJobs() {
  try {
    loading.value = true
    const filters: any = {}
    if (filterStatus.value) {
      filters.status = filterStatus.value
    }
    const data = await getJobs(filters)
    jobs.value = data.jobs
  } catch (error: any) {
    console.error('載入任務失敗:', error)
  } finally {
    loading.value = false
  }
}

// 重試任務
async function handleRetry(jobId: number) {
  if (retryingJobs.value.has(jobId)) return
  
  try {
    retryingJobs.value.add(jobId)
    await retryJob(jobId)
    await loadJobs()
  } catch (error: any) {
    console.error('重試任務失敗:', error)
    alert(error.response?.data?.error || '重試失敗')
  } finally {
    retryingJobs.value.delete(jobId)
  }
}

// 取消任務
async function handleCancel(jobId: number) {
  if (cancelingJobs.value.has(jobId)) return
  
  if (!confirm('確定要取消此任務嗎?')) return
  
  try {
    cancelingJobs.value.add(jobId)
    await cancelJob(jobId)
    await loadJobs()
  } catch (error: any) {
    console.error('取消任務失敗:', error)
    alert(error.response?.data?.error || '取消失敗')
  } finally {
    cancelingJobs.value.delete(jobId)
  }
}

// 取得任務類型標籤
function getJobTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'data_import': '資料匯入',
    'report_generation': '報告生成',
    'email_notification': '郵件通知',
    'data_export': '資料匯出',
    'batch_update': '批次更新'
  }
  return labels[type] || type
}

// 取得狀態標籤
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'PENDING': '待處理',
    'RUNNING': '執行中',
    'SUCCEEDED': '已完成',
    'FAILED': '失敗'
  }
  return labels[status] || status
}

// 取得狀態樣式類別
function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    'PENDING': 'status-pending',
    'RUNNING': 'status-running',
    'SUCCEEDED': 'status-succeeded',
    'FAILED': 'status-failed'
  }
  return classes[status] || ''
}

// 取得進度百分比
function getProgress(job: Job): number {
  // 如果任務有提供進度資訊，使用它
  // 否則使用預設值 (執行中顯示 50%)
  return 50
}

// 格式化日期時間
function formatDateTime(datetime: string | null): string {
  if (!datetime) return '-'
  const date = new Date(datetime)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 監聽篩選狀態變化
watch(filterStatus, () => {
  loadJobs()
})

// 元件掛載時載入任務並啟動輪詢
onMounted(() => {
  loadJobs()
  // 每 5 秒自動刷新
  pollInterval = window.setInterval(() => {
    loadJobs()
  }, 5000)
})

// 元件卸載時停止輪詢
onUnmounted(() => {
  if (pollInterval !== null) {
    clearInterval(pollInterval)
  }
})
</script>

<style scoped>
.jobs-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 頁面標題 */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
}

/* 狀態標籤 */
.status-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tab {
  flex: 1;
  min-width: 120px;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  border-color: #667eea;
  color: #667eea;
}

.tab.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

/* Loading */
.loading-container {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #f3f4f6;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  color: #d1d5db;
}

.empty-text {
  font-size: 1.1rem;
  color: #9ca3af;
}

/* 任務列表 */
.jobs-list {
  display: grid;
  gap: 1.5rem;
}

.job-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

/* 卡片頭部 */
.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.job-info {
  flex: 1;
}

.job-type {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.job-id {
  font-size: 0.875rem;
  color: #6b7280;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-running {
  background: #dbeafe;
  color: #1e40af;
}

.status-succeeded {
  background: #d1fae5;
  color: #065f46;
}

.status-failed {
  background: #fee2e2;
  color: #991b1b;
}

/* 進度條 */
.progress-container {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #667eea;
  min-width: 45px;
  text-align: right;
}

/* 任務詳情 */
.job-details {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  gap: 0.5rem;
}

.detail-label {
  font-weight: 600;
  color: #6b7280;
  min-width: 80px;
}

.detail-value {
  color: #1f2937;
}

.error-text {
  color: #dc2626;
  font-weight: 500;
}

/* 操作按鈕 */
.job-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-retry,
.btn-cancel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry {
  background: #667eea;
  color: white;
}

.btn-retry:hover:not(:disabled) {
  background: #5568d3;
}

.btn-cancel {
  background: #ef4444;
  color: white;
}

.btn-cancel:hover:not(:disabled) {
  background: #dc2626;
}

.btn-retry:disabled,
.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 自動刷新指示器 */
.auto-refresh-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
}

.refresh-icon {
  width: 20px;
  height: 20px;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .status-tabs {
    flex-direction: column;
  }

  .tab {
    min-width: auto;
  }

  .job-header {
    flex-direction: column;
    gap: 1rem;
  }

  .detail-item {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-label {
    min-width: auto;
  }
}
</style>
