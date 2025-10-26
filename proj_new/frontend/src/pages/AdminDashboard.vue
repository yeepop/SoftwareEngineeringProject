<template>
  <div class="admin-dashboard min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">管理後台</h1>

      <!-- 統計卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">待審核動物</p>
              <p class="text-2xl font-bold text-orange-600">{{ stats.submitted }}</p>
            </div>
            <div class="text-orange-500 text-3xl">⏳</div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">已發布動物</p>
              <p class="text-2xl font-bold text-green-600">{{ stats.published }}</p>
            </div>
            <div class="text-green-500 text-3xl">✓</div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">草稿動物</p>
              <p class="text-2xl font-bold text-gray-600">{{ stats.draft }}</p>
            </div>
            <div class="text-gray-500 text-3xl">📝</div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">已下架動物</p>
              <p class="text-2xl font-bold text-red-600">{{ stats.retired }}</p>
            </div>
            <div class="text-red-500 text-3xl">✗</div>
          </div>
        </div>
      </div>

      <!-- 快速連結 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          @click="router.push('/admin/applications')"
          class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition text-left"
        >
          <div class="flex items-center gap-3">
            <div class="text-3xl">📋</div>
            <div>
              <p class="font-semibold text-gray-900">申請審核管理</p>
              <p class="text-sm text-gray-600">審核領養申請</p>
            </div>
          </div>
        </button>

        <button
          @click="router.push('/medical-records')"
          class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition text-left"
        >
          <div class="flex items-center gap-3">
            <div class="text-3xl">🏥</div>
            <div>
              <p class="font-semibold text-gray-900">醫療記錄管理</p>
              <p class="text-sm text-gray-600">查看與驗證醫療記錄</p>
            </div>
          </div>
        </button>

        <button
          @click="router.push('/jobs')"
          class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition text-left"
        >
          <div class="flex items-center gap-3">
            <div class="text-3xl">📊</div>
            <div>
              <p class="font-semibold text-gray-900">任務狀態</p>
              <p class="text-sm text-gray-600">查看背景任務執行狀態</p>
            </div>
          </div>
        </button>

        <button
          @click="router.push('/notifications')"
          class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition text-left"
        >
          <div class="flex items-center gap-3">
            <div class="text-3xl">🔔</div>
            <div>
              <p class="font-semibold text-gray-900">通知中心</p>
              <p class="text-sm text-gray-600">查看所有通知</p>
            </div>
          </div>
        </button>

        <button
          @click="router.push('/audit-logs')"
          class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition text-left"
        >
          <div class="flex items-center gap-3">
            <div class="text-3xl">📋</div>
            <div>
              <p class="font-semibold text-gray-900">審計日誌</p>
              <p class="text-sm text-gray-600">查看系統操作記錄</p>
            </div>
          </div>
        </button>

        <button
          @click="router.push('/admin/users')"
          class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition text-left"
        >
          <div class="flex items-center gap-3">
            <div class="text-3xl">👥</div>
            <div>
              <p class="font-semibold text-gray-900">用戶管理</p>
              <p class="text-sm text-gray-600">管理系統用戶與權限</p>
            </div>
          </div>
        </button>
      </div>

      <!-- 狀態篩選 -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="p-4 border-b border-gray-200">
          <div class="flex gap-2">
            <button
              v-for="status in statusOptions"
              :key="status.value"
              @click="currentStatus = status.value; loadAnimals()"
              class="px-4 py-2 rounded-lg font-medium transition"
              :class="currentStatus === status.value 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              {{ status.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">載入中...</p>
      </div>

      <!-- 動物列表 -->
      <div v-else-if="animals.length > 0" class="space-y-4">
        <div
          v-for="animal in animals"
          :key="animal.animal_id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
        >
          <div class="flex gap-6">
            <!-- 圖片 -->
            <div class="flex-shrink-0">
              <img
                v-if="animal.images && animal.images.length > 0"
                :src="animal.images[0].url"
                :alt="animal.name"
                class="w-32 h-32 rounded-lg object-cover"
              />
              <div v-else class="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center">
                <span class="text-4xl">🐾</span>
              </div>
            </div>

            <!-- 資訊 -->
            <div class="flex-1">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h3 class="text-xl font-bold text-gray-900">{{ animal.name || '未命名' }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ getSpeciesText(animal.species || '') }} 
                    <span v-if="animal.breed">· {{ animal.breed }}</span>
                    <span v-if="animal.sex">· {{ getSexText(animal.sex) }}</span>
                  </p>
                </div>
                <span
                  class="px-3 py-1 text-sm font-semibold rounded-full"
                  :class="getStatusClass(animal.status)"
                >
                  {{ getStatusText(animal.status) }}
                </span>
              </div>

              <p v-if="animal.description" class="text-gray-700 mb-4 line-clamp-2">
                {{ animal.description }}
              </p>

              <div class="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>ID: {{ animal.animal_id }}</span>
                <span>建立時間: {{ formatDate(animal.created_at) }}</span>
              </div>

              <!-- 操作按鈕 -->
              <div class="flex gap-2">
                <button
                  v-if="animal.status === 'SUBMITTED'"
                  @click="publishAnimal(animal.animal_id)"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  :disabled="isProcessing"
                >
                  ✓ 核准發布
                </button>

                <button
                  v-if="animal.status === 'PUBLISHED'"
                  @click="retireAnimal(animal.animal_id)"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  :disabled="isProcessing"
                >
                  下架
                </button>

                <button
                  @click="viewDetail(animal.animal_id)"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  查看詳情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-else class="bg-white rounded-lg shadow p-12 text-center">
        <div class="text-6xl mb-4">📭</div>
        <p class="text-xl text-gray-600">目前沒有 {{ getCurrentStatusLabel() }} 的動物</p>
      </div>

      <!-- 分頁 -->
      <div v-if="pagination.pages > 1" class="mt-6 flex justify-center gap-2">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一頁
        </button>
        
        <span class="px-4 py-2 text-gray-700">
          第 {{ pagination.page }} / {{ pagination.pages }} 頁
        </span>
        
        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.pages"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一頁
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAnimals, publishAnimal as publishAnimalAPI, retireAnimal as retireAnimalAPI, type Animal } from '@/api/animals'

const router = useRouter()

const animals = ref<Animal[]>([])
const isLoading = ref(false)
const isProcessing = ref(false)
const currentStatus = ref('SUBMITTED')
const stats = ref({
  draft: 0,
  submitted: 0,
  published: 0,
  retired: 0
})

const pagination = ref({
  page: 1,
  per_page: 20,
  pages: 1,
  total: 0
})

const statusOptions = [
  { value: 'SUBMITTED', label: '待審核' },
  { value: 'PUBLISHED', label: '已發布' },
  { value: 'DRAFT', label: '草稿' },
  { value: 'RETIRED', label: '已下架' }
]

// 載入動物列表
async function loadAnimals() {
  isLoading.value = true
  try {
    const response = await getAnimals({
      status: currentStatus.value as any,
      page: pagination.value.page,
      per_page: pagination.value.per_page
    })
    
    animals.value = response.animals
    pagination.value = {
      page: response.page,
      per_page: response.per_page,
      pages: response.pages,
      total: response.total
    }
  } catch (error: any) {
    console.error('Load animals error:', error)
    alert('載入失敗: ' + (error.response?.data?.message || error.message))
  } finally {
    isLoading.value = false
  }
}

// 載入統計資料
async function loadStats() {
  try {
    const statuses = ['DRAFT', 'SUBMITTED', 'PUBLISHED', 'RETIRED']
    const requests = statuses.map(status => 
      getAnimals({ status: status as any, per_page: 1 })
    )
    
    const results = await Promise.all(requests)
    stats.value = {
      draft: results[0].total,
      submitted: results[1].total,
      published: results[2].total,
      retired: results[3].total
    }
  } catch (error) {
    console.error('Load stats error:', error)
  }
}

// 核准發布動物
async function publishAnimal(animalId: number) {
  if (!confirm('確定要核准發布此動物嗎?')) return
  
  isProcessing.value = true
  try {
    await publishAnimalAPI(animalId)
    alert('動物已發布')
    await loadAnimals()
    await loadStats()
  } catch (error: any) {
    console.error('Publish error:', error)
    alert('發布失敗: ' + (error.response?.data?.message || error.message))
  } finally {
    isProcessing.value = false
  }
}

// 下架動物
async function retireAnimal(animalId: number) {
  if (!confirm('確定要下架此動物嗎?')) return
  
  isProcessing.value = true
  try {
    await retireAnimalAPI(animalId)
    alert('動物已下架')
    await loadAnimals()
    await loadStats()
  } catch (error: any) {
    console.error('Retire error:', error)
    alert('下架失敗: ' + (error.response?.data?.message || error.message))
  } finally {
    isProcessing.value = false
  }
}

// 查看詳情
function viewDetail(animalId: number) {
  router.push(`/animals/${animalId}`)
}

// 切換頁面
function changePage(page: number) {
  pagination.value.page = page
  loadAnimals()
}

// 工具函數
function getSpeciesText(species: string): string {
  const map: Record<string, string> = {
    CAT: '貓',
    DOG: '狗'
  }
  return map[species] || species
}

function getSexText(sex: string): string {
  const map: Record<string, string> = {
    MALE: '公',
    FEMALE: '母',
    UNKNOWN: '未知'
  }
  return map[sex] || sex
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    DRAFT: '草稿',
    SUBMITTED: '待審核',
    PUBLISHED: '已發布',
    RETIRED: '已下架'
  }
  return map[status] || status
}

function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-orange-100 text-orange-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    RETIRED: 'bg-red-100 text-red-800'
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getCurrentStatusLabel(): string {
  const option = statusOptions.find(opt => opt.value === currentStatus.value)
  return option?.label || ''
}

onMounted(() => {
  loadAnimals()
  loadStats()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

