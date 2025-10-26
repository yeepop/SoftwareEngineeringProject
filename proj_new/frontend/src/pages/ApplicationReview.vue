<template>
  <div class="application-review-page">
    <div class="container">
      <!-- 頁面標題 -->
      <div class="page-header">
        <h1 class="page-title">申請審核管理</h1>
        <p class="page-description">審核與處理領養申請</p>
        <div v-if="route.query.animal_id" class="filter-notice">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>正在顯示特定動物的申請</span>
          <button @click="clearAnimalFilter" class="clear-filter-btn">清除篩選</button>
        </div>
      </div>

      <!-- 統計卡片 -->
      <div class="stats-grid">
        <div class="stat-card pending">
          <div class="stat-icon">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">待審核</div>
          </div>
        </div>

        <div class="stat-card under-review">
          <div class="stat-icon">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.underReview }}</div>
            <div class="stat-label">審核中</div>
          </div>
        </div>

        <div class="stat-card approved">
          <div class="stat-icon">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.approved }}</div>
            <div class="stat-label">已通過</div>
          </div>
        </div>

        <div class="stat-card rejected">
          <div class="stat-icon">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.rejected }}</div>
            <div class="stat-label">已拒絕</div>
          </div>
        </div>
      </div>

      <!-- 篩選標籤 -->
      <div class="filter-tabs">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          :class="['filter-tab', { active: currentFilter === tab.value }]"
          @click="changeFilter(tab.value)"
        >
          {{ tab.label }}
          <span class="tab-count">{{ getTabCount(tab.value) }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>載入中...</p>
      </div>

      <!-- 申請列表 -->
      <div v-else-if="applications.length > 0" class="applications-list">
        <div
          v-for="application in applications"
          :key="application.application_id"
          class="application-card"
        >
          <!-- 卡片頭部 -->
          <div class="card-header">
            <div class="applicant-info">
              <div class="applicant-avatar">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <div class="applicant-name">
                  {{ application.applicant?.username || application.applicant?.email }}
                </div>
                <div class="application-date">
                  申請時間: {{ formatDate(application.submitted_at) }}
                </div>
              </div>
            </div>
            <div :class="['status-badge', application.status.toLowerCase()]">
              {{ getStatusText(application.status) }}
            </div>
          </div>

          <!-- 動物資訊 -->
          <div class="animal-info">
            <div v-if="application.animal?.images?.[0]" class="animal-image">
              <img :src="application.animal.images[0].url" :alt="application.animal.name" />
            </div>
            <div v-else class="animal-image-placeholder">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="animal-details">
              <h3 class="animal-name">{{ application.animal?.name }}</h3>
              <div class="animal-meta">
                <span>{{ application.animal?.species }}</span>
                <span>•</span>
                <span>{{ application.animal?.breed }}</span>
                <span>•</span>
                <span>{{ application.animal?.age }} 歲</span>
              </div>
            </div>
          </div>

          <!-- 審核資訊 -->
          <div v-if="application.assignee" class="reviewer-info">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>審核者: {{ application.assignee.username || application.assignee.email }}</span>
          </div>

          <div v-if="application.review_notes" class="review-notes">
            <strong>審核備註:</strong> {{ application.review_notes }}
          </div>

          <!-- 操作按鈕 -->
          <div class="card-actions">
            <button class="btn-view" @click="viewAnimalDetail(application.animal_id)">
              查看動物
            </button>
            <button
              v-if="canAssign(application)"
              class="btn-assign"
              @click="openAssignModal(application)"
            >
              分配審核者
            </button>
            <button
              v-if="canReview(application)"
              class="btn-approve"
              @click="openReviewModal(application, 'approve')"
            >
              通過
            </button>
            <button
              v-if="canReview(application)"
              class="btn-reject"
              @click="openReviewModal(application, 'reject')"
            >
              拒絕
            </button>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-else class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3>目前沒有{{ getFilterText() }}的申請</h3>
        <p>當有新的申請時，將會顯示在這裡</p>
      </div>

      <!-- 分頁 -->
      <div v-if="pagination.pages > 1" class="pagination">
        <button
          :disabled="pagination.page === 1"
          class="pagination-btn"
          @click="changePage(pagination.page - 1)"
        >
          上一頁
        </button>
        <span class="pagination-info">
          第 {{ pagination.page }} 頁，共 {{ pagination.pages }} 頁
        </span>
        <button
          :disabled="pagination.page === pagination.pages"
          class="pagination-btn"
          @click="changePage(pagination.page + 1)"
        >
          下一頁
        </button>
      </div>
    </div>

    <!-- 審核 Modal -->
    <Teleport to="body">
      <div v-if="showReviewModal" class="modal-overlay" @click="closeReviewModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">
              {{ reviewAction === 'approve' ? '通過申請' : '拒絕申請' }}
            </h2>
            <button class="modal-close" @click="closeReviewModal">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="selectedApplication" class="review-summary">
              <p><strong>申請人:</strong> {{ selectedApplication.applicant?.username }}</p>
              <p><strong>動物:</strong> {{ selectedApplication.animal?.name }}</p>
            </div>

            <div class="form-group">
              <label>審核備註</label>
              <textarea
                v-model="reviewNotes"
                rows="4"
                :placeholder="reviewAction === 'approve' ? '請輸入通過的原因或注意事項' : '請輸入拒絕的原因'"
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="closeReviewModal">取消</button>
            <button
              :class="['btn-confirm', reviewAction === 'approve' ? 'approve' : 'reject']"
              @click="submitReview"
              :disabled="submitting"
            >
              {{ submitting ? '處理中...' : (reviewAction === 'approve' ? '確認通過' : '確認拒絕') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 分配審核者 Modal -->
    <Teleport to="body">
      <div v-if="showAssignModal" class="modal-overlay" @click="closeAssignModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">分配審核者</h2>
            <button class="modal-close" @click="closeAssignModal">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>選擇審核者</label>
              <select v-model="selectedAssigneeId" class="form-select">
                <option value="">請選擇...</option>
                <option
                  v-for="reviewer in reviewers"
                  :key="reviewer.user_id"
                  :value="reviewer.user_id"
                >
                  {{ reviewer.username || reviewer.email }} ({{ reviewer.role }})
                </option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="closeAssignModal">取消</button>
            <button
              class="btn-confirm"
              @click="submitAssign"
              :disabled="!selectedAssigneeId || submitting"
            >
              {{ submitting ? '處理中...' : '確認分配' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  getApplications,
  reviewApplication,
  assignApplication,
  type Application
} from '@/api/applications'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'

const router = useRouter()
const route = useRoute()

// 狀態
const loading = ref(false)
const submitting = ref(false)
const applications = ref<Application[]>([])
const currentFilter = ref<string>('all')
const pagination = ref({
  page: 1,
  per_page: 10,
  total: 0,
  pages: 0
})

// Modal 狀態
const showReviewModal = ref(false)
const showAssignModal = ref(false)
const selectedApplication = ref<Application | null>(null)
const reviewAction = ref<'approve' | 'reject'>('approve')
const reviewNotes = ref('')
const selectedAssigneeId = ref<number | string>('')

// 審核者列表 (TODO: 從 API 獲取)
const reviewers = ref<any[]>([
  { user_id: 1, username: 'Admin', email: 'admin@example.com', role: 'ADMIN' }
])

// 篩選標籤
const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '待審核', value: 'PENDING' },
  { label: '審核中', value: 'UNDER_REVIEW' },
  { label: '已通過', value: 'APPROVED' },
  { label: '已拒絕', value: 'REJECTED' }
]

// 統計數據
const stats = computed(() => {
  return {
    pending: applications.value.filter(a => a.status === 'PENDING').length,
    underReview: applications.value.filter(a => a.status === 'UNDER_REVIEW').length,
    approved: applications.value.filter(a => a.status === 'APPROVED').length,
    rejected: applications.value.filter(a => a.status === 'REJECTED').length
  }
})

// 獲取申請列表
const fetchApplications = async () => {
  loading.value = true
  try {
    const filters: any = {
      page: pagination.value.page,
      per_page: pagination.value.per_page
    }
    
    if (currentFilter.value !== 'all') {
      filters.status = currentFilter.value
    }
    
    // 支援從 URL 參數篩選特定動物的申請
    const animalId = route.query.animal_id
    if (animalId) {
      filters.animal_id = Number(animalId)
    }
    
    const response = await getApplications(filters)
    applications.value = response.items
    pagination.value = {
      page: response.page,
      per_page: response.per_page,
      total: response.total,
      pages: response.pages
    }
  } catch (error) {
    console.error('Failed to fetch applications:', error)
  } finally {
    loading.value = false
  }
}

// 切換篩選
const changeFilter = (filter: string) => {
  currentFilter.value = filter
  pagination.value.page = 1
  fetchApplications()
}

// 清除動物篩選
const clearAnimalFilter = () => {
  router.push('/admin/applications')
}

// 切換頁面
const changePage = (page: number) => {
  pagination.value.page = page
  fetchApplications()
}

// 獲取標籤數量
const getTabCount = (filter: string) => {
  if (filter === 'all') return pagination.value.total
  const statusMap: Record<string, keyof typeof stats.value> = {
    'PENDING': 'pending',
    'UNDER_REVIEW': 'underReview',
    'APPROVED': 'approved',
    'REJECTED': 'rejected'
  }
  return stats.value[statusMap[filter]] || 0
}

// 獲取篩選文字
const getFilterText = () => {
  const tab = filterTabs.find(t => t.value === currentFilter.value)
  return tab ? tab.label : ''
}

// 獲取狀態文字
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'PENDING': '待審核',
    'UNDER_REVIEW': '審核中',
    'APPROVED': '已通過',
    'REJECTED': '已拒絕',
    'WITHDRAWN': '已撤回'
  }
  return map[status] || status
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: zhTW
    })
  } catch {
    return dateString
  }
}

// 權限檢查
const canReview = (application: Application) => {
  return application.status === 'PENDING' || application.status === 'UNDER_REVIEW'
}

const canAssign = (application: Application) => {
  return application.status === 'PENDING' || application.status === 'UNDER_REVIEW'
}

// 查看申請詳情
const viewAnimalDetail = (animalId: number) => {
  router.push(`/animals/${animalId}`)
}

// 打開審核 Modal
const openReviewModal = (application: Application, action: 'approve' | 'reject') => {
  selectedApplication.value = application
  reviewAction.value = action
  reviewNotes.value = ''
  showReviewModal.value = true
}

// 關閉審核 Modal
const closeReviewModal = () => {
  showReviewModal.value = false
  selectedApplication.value = null
  reviewNotes.value = ''
}

// 提交審核
const submitReview = async () => {
  if (!selectedApplication.value) return
  
  submitting.value = true
  try {
    await reviewApplication(selectedApplication.value.application_id, {
      action: reviewAction.value,
      review_notes: reviewNotes.value,
      version: selectedApplication.value.version
    })
    
    alert(`申請${reviewAction.value === 'approve' ? '通過' : '拒絕'}成功！`)
    closeReviewModal()
    fetchApplications()
  } catch (error: any) {
    if (error.response?.status === 409) {
      alert('申請已被其他人修改，請重新載入頁面')
    } else {
      alert('操作失敗: ' + (error.response?.data?.message || error.message))
    }
  } finally {
    submitting.value = false
  }
}

// 打開分配 Modal
const openAssignModal = (application: Application) => {
  selectedApplication.value = application
  selectedAssigneeId.value = application.assignee_id || ''
  showAssignModal.value = true
}

// 關閉分配 Modal
const closeAssignModal = () => {
  showAssignModal.value = false
  selectedApplication.value = null
  selectedAssigneeId.value = ''
}

// 提交分配
const submitAssign = async () => {
  if (!selectedApplication.value || !selectedAssigneeId.value) return
  
  submitting.value = true
  try {
    await assignApplication(
      selectedApplication.value.application_id,
      Number(selectedAssigneeId.value)
    )
    
    alert('分配成功！')
    closeAssignModal()
    fetchApplications()
  } catch (error: any) {
    alert('分配失敗: ' + (error.response?.data?.message || error.message))
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
.application-review-page {
  min-height: 100vh;
  background: #f7fafc;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 頁面標題 */
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.page-description {
  color: #718096;
}

.filter-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 0.375rem;
  color: #1e40af;
  font-size: 0.875rem;
}

.clear-filter-btn {
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  background-color: white;
  border: 1px solid #93c5fd;
  border-radius: 0.25rem;
  color: #1e40af;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filter-btn:hover {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* 統計卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.pending .stat-icon {
  background: #fef5e7;
  color: #f39c12;
}

.stat-card.under-review .stat-icon {
  background: #e8f4fd;
  color: #3498db;
}

.stat-card.approved .stat-icon {
  background: #e8f8f5;
  color: #27ae60;
}

.stat-card.rejected .stat-icon {
  background: #fadbd8;
  color: #e74c3c;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
}

.stat-label {
  color: #718096;
  font-size: 0.875rem;
}

/* 篩選標籤 */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
  overflow-x: auto;
}

.filter-tab {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: #718096;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-tab:hover {
  color: #2d3748;
}

.filter-tab.active {
  color: #3182ce;
  border-bottom-color: #3182ce;
}

.tab-count {
  margin-left: 0.5rem;
  padding: 0.125rem 0.5rem;
  background: #edf2f7;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.filter-tab.active .tab-count {
  background: #bee3f8;
  color: #2c5282;
}

/* 申請列表 */
.applications-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.application-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.application-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.applicant-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.applicant-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: #edf2f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
}

.applicant-name {
  font-weight: 600;
  color: #1a202c;
}

.application-date {
  font-size: 0.875rem;
  color: #718096;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #fef5e7;
  color: #f39c12;
}

.status-badge.under_review {
  background: #e8f4fd;
  color: #3498db;
}

.status-badge.approved {
  background: #e8f8f5;
  color: #27ae60;
}

.status-badge.rejected {
  background: #fadbd8;
  color: #e74c3c;
}

/* 動物資訊 */
.animal-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.animal-image,
.animal-image-placeholder {
  width: 5rem;
  height: 5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.animal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.animal-image-placeholder {
  background: #edf2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e0;
}

.animal-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.animal-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #718096;
}

/* 審核資訊 */
.reviewer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.review-notes {
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 1rem;
}

/* 操作按鈕 */
.card-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.card-actions button,
.card-actions a {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-view {
  background: #edf2f7;
  color: #2d3748;
  border: none;
}

.btn-view:hover {
  background: #e2e8f0;
}

.btn-assign {
  background: #e8f4fd;
  color: #2c5282;
  border: none;
}

.btn-assign:hover {
  background: #bee3f8;
}

.btn-approve {
  background: #27ae60;
  color: white;
  border: none;
}

.btn-approve:hover {
  background: #229954;
}

.btn-reject {
  background: #e74c3c;
  color: white;
  border: none;
}

.btn-reject:hover {
  background: #c0392b;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e2e8f0;
  border-top-color: #3182ce;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #cbd5e0;
  margin: 0 auto 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #718096;
}

/* 分頁 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  color: #2d3748;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #718096;
  font-size: 0.875rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
}

.modal-close {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.review-summary {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 0.375rem;
}

.review-summary p {
  margin-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel,
.btn-confirm {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #edf2f7;
  border: none;
  color: #2d3748;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-confirm {
  background: #3182ce;
  border: none;
  color: white;
}

.btn-confirm.approve {
  background: #27ae60;
}

.btn-confirm.reject {
  background: #e74c3c;
}

.btn-confirm:hover {
  opacity: 0.9;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 響應式 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .animal-info {
    flex-direction: column;
  }
  
  .animal-image,
  .animal-image-placeholder {
    width: 100%;
    height: 12rem;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .card-actions button,
  .card-actions a {
    width: 100%;
  }
}
</style>
