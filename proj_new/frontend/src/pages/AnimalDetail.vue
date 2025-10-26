<template>
  <div class="animal-detail-page min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Loading 狀態 -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">載入中...</p>
      </div>

      <!-- 錯誤訊息 -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
        <div class="mt-4">
          <router-link to="/animals" class="text-blue-600 hover:text-blue-700">
            返回動物列表
          </router-link>
        </div>
      </div>

      <!-- 動物詳情 -->
      <div v-else-if="animal" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- 左側：圖片 -->
          <div class="relative">
            <div class="aspect-w-4 aspect-h-3 bg-gray-200">
              <img
                v-if="currentImage"
                :src="currentImage.url"
                :alt="animal.name || '動物照片'"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <span class="text-8xl">🐾</span>
              </div>
            </div>

            <!-- 圖片縮圖 -->
            <div v-if="animal.images && animal.images.length > 1" class="flex gap-2 p-4 overflow-x-auto">
              <button
                v-for="(image, index) in sortedImages"
                :key="image.animal_image_id"
                @click="currentImageIndex = index"
                class="flex-shrink-0 w-20 h-20 border-2 rounded-md overflow-hidden"
                :class="currentImageIndex === index ? 'border-blue-600' : 'border-gray-300'"
              >
                <img :src="image.url" :alt="`圖片 ${index + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- 右側：詳細資訊 -->
          <div class="p-8">
            <!-- 狀態標籤 -->
            <div class="mb-4 flex gap-2">
              <span
                class="inline-block px-3 py-1 text-sm font-semibold rounded-full"
                :class="statusClass"
              >
                {{ statusText }}
              </span>
              <!-- 我的寵物標籤 -->
              <span
                v-if="isMyAnimal"
                class="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-purple-500 text-white"
              >
                👤 我的寵物
              </span>
            </div>

            <!-- 名稱 -->
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
              {{ animal.name || '未命名動物' }}
            </h1>

            <!-- 基本資訊 -->
            <div class="space-y-3 mb-6">
              <div class="flex items-center text-gray-700">
                <span class="w-24 font-medium">物種:</span>
                <span>{{ speciesText }} {{ animal.breed ? `(${animal.breed})` : '' }}</span>
              </div>
              <div v-if="animal.sex" class="flex items-center text-gray-700">
                <span class="w-24 font-medium">性別:</span>
                <span>{{ sexText }}</span>
              </div>
              <div v-if="age" class="flex items-center text-gray-700">
                <span class="w-24 font-medium">年齡:</span>
                <span>{{ age }}</span>
              </div>
              <div class="flex items-center text-gray-700">
                <span class="w-24 font-medium">來源:</span>
                <span v-if="animal.shelter_id">🏠 收容所</span>
                <span v-else-if="animal.owner_id">👤 個人送養</span>
              </div>
            </div>

            <!-- 描述 -->
            <div v-if="animal.description" class="mb-6">
              <h2 class="text-xl font-bold text-gray-900 mb-3">關於我</h2>
              <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ animal.description }}</p>
            </div>

            <!-- 醫療摘要 -->
            <div v-if="animal.medical_summary" class="mb-6">
              <h2 class="text-xl font-bold text-gray-900 mb-3">健康狀況</h2>
              <p class="text-gray-700 leading-relaxed">{{ animal.medical_summary }}</p>
            </div>

            <!-- 行動按鈕 -->
            <div class="flex gap-4 mt-8">
              <!-- 已被領養提示 -->
              <div v-if="animal.status === 'ADOPTED'" class="flex-1 bg-blue-50 border-2 border-blue-200 text-blue-800 px-6 py-3 rounded-lg font-semibold text-center">
                💙 此動物已被領養
              </div>
              
              <!-- 我想領養按鈕 (非自己的動物且未被領養才顯示) -->
              <button
                v-else-if="animal.status === 'PUBLISHED' && isAuthenticated && !isMyAnimal"
                @click="handleApply"
                class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                我想領養
              </button>
              <button
                v-else-if="animal.status === 'PUBLISHED' && !isAuthenticated && !isMyAnimal"
                @click="goToLogin"
                class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                登入以領養
              </button>

              <!-- 編輯按鈕 (僅 owner 可見) -->
              <button
                v-if="canEdit"
                @click="goToEdit"
                class="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                :class="{ 'flex-1': isMyAnimal || animal.status === 'ADOPTED' }"
              >
                編輯
              </button>
            </div>
          </div>
        </div>

        <!-- 其他資訊區塊 -->
        <div class="px-8 py-6 border-t border-gray-200 bg-gray-50">
          <p class="text-sm text-gray-500">
            發布於: {{ formattedDate }}
          </p>
        </div>
      </div>

      <!-- 返回按鈕 -->
      <div class="mt-6">
        <router-link
          to="/animals"
          class="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          ← 返回動物列表
        </router-link>
      </div>
    </div>

    <!-- 申請表單對話框 -->
    <div
      v-if="showApplicationModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeApplicationModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">申請領養</h3>
            <button @click="closeApplicationModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6">
          <!-- 錯誤訊息 -->
          <div v-if="applicationError" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {{ applicationError }}
          </div>

          <!-- 動物資訊摘要 -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-4">
              <img
                v-if="currentImage"
                :src="currentImage.url"
                :alt="animal?.name"
                class="w-20 h-20 rounded-lg object-cover"
              />
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">{{ animal?.name }}</h4>
                <p class="text-sm text-gray-600">{{ speciesText }} {{ animal?.breed ? `· ${animal.breed}` : '' }}</p>
              </div>
            </div>
          </div>

          <!-- 申請表單 -->
          <form @submit.prevent="submitApplication" class="space-y-4">
            <!-- 申請類型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                申請類型 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="applicationForm.type"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="ADOPTION">領養</option>
                <option value="REHOME">中途送養</option>
              </select>
            </div>

            <!-- 聯絡資訊說明 -->
            <div class="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
              <p class="font-medium text-blue-900 mb-1">📝 申請說明</p>
              <ul class="list-disc list-inside space-y-1">
                <li>提交後將使用您的註冊資料進行審核</li>
                <li>審核期間可能需要 1-3 個工作天</li>
                <li>審核結果將透過系統通知您</li>
              </ul>
            </div>

            <!-- 確認條款 -->
            <div class="flex items-start">
              <input
                id="agree-terms"
                v-model="agreeTerms"
                type="checkbox"
                class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="agree-terms" class="ml-2 text-sm text-gray-700">
                我同意並理解領養需負起照顧動物的責任,並遵守相關法規
              </label>
            </div>

            <!-- 按鈕 -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeApplicationModal"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                :disabled="isSubmitting"
              >
                取消
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isSubmitting || !agreeTerms"
              >
                <span v-if="isSubmitting">提交中...</span>
                <span v-else>確認申請</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAnimal, type Animal } from '@/api/animals'
import { createApplication } from '@/api/applications'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const animal = ref<Animal | null>(null)
const isLoading = ref(false)
const error = ref('')
const currentImageIndex = ref(0)

// 申請表單相關狀態
const showApplicationModal = ref(false)
const isSubmitting = ref(false)
const applicationError = ref('')
const agreeTerms = ref(false)
const applicationForm = ref({
  type: 'ADOPTION' as 'ADOPTION' | 'REHOME'
})

const isAuthenticated = computed(() => authStore.isAuthenticated)

// 排序後的圖片
const sortedImages = computed(() => {
  if (!animal.value?.images) return []
  return [...animal.value.images].sort((a, b) => a.order - b.order)
})

// 當前圖片
const currentImage = computed(() => {
  if (sortedImages.value.length === 0) return null
  return sortedImages.value[currentImageIndex.value] || sortedImages.value[0]
})

// 物種文字
const speciesText = computed(() => {
  const map: Record<string, string> = {
    CAT: '貓',
    DOG: '狗',
  }
  return animal.value?.species ? map[animal.value.species] : '未知'
})

// 性別文字
const sexText = computed(() => {
  const map: Record<string, string> = {
    MALE: '公',
    FEMALE: '母',
    UNKNOWN: '未知',
  }
  return animal.value?.sex ? map[animal.value.sex] : '未知'
})

// 狀態文字
const statusText = computed(() => {
  const map: Record<string, string> = {
    DRAFT: '草稿',
    SUBMITTED: '審核中',
    PUBLISHED: '已上架',
    ADOPTED: '已被領養',
    RETIRED: '已下架',
  }
  return animal.value ? map[animal.value.status] || '未知' : ''
})

// 狀態樣式
const statusClass = computed(() => {
  const map: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    ADOPTED: 'bg-blue-100 text-blue-800',
    RETIRED: 'bg-red-100 text-red-800',
  }
  return animal.value ? map[animal.value.status] || 'bg-gray-100 text-gray-800' : ''
})

// 計算年齡
const age = computed(() => {
  if (!animal.value?.dob) return null

  const birthDate = new Date(animal.value.dob)
  const today = new Date()
  const years = today.getFullYear() - birthDate.getFullYear()
  const months = today.getMonth() - birthDate.getMonth()

  if (years === 0) {
    return `${months} 個月`
  } else if (months < 0) {
    return `${years - 1} 歲`
  } else {
    return `${years} 歲 ${months} 個月`
  }
})

// 格式化日期
const formattedDate = computed(() => {
  if (!animal.value) return ''
  const date = new Date(animal.value.created_at)
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
})

// 是否可以編輯
const canEdit = computed(() => {
  if (!animal.value || !authStore.user) return false
  return animal.value.created_by === authStore.user.user_id || authStore.isAdmin
})

// 是否為我的動物
const isMyAnimal = computed(() => {
  if (!animal.value || !authStore.user) return false
  return animal.value.created_by === authStore.user.user_id
})

// 載入動物詳情
async function loadAnimal() {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    error.value = '無效的動物 ID'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    animal.value = await getAnimal(id)
  } catch (err: any) {
    console.error('Load animal error:', err)
    if (err.response?.status === 404) {
      error.value = '找不到此動物'
    } else {
      error.value = err.response?.data?.message || '載入失敗'
    }
  } finally {
    isLoading.value = false
  }
}

// 處理申請
function handleApply() {
  if (!animal.value) return
  
  // 檢查是否為自己的動物
  if (animal.value.created_by === authStore.user?.user_id) {
    applicationError.value = '您不能申請自己刊登的動物'
    return
  }
  
  // 重置表單
  applicationForm.value.type = 'ADOPTION'
  agreeTerms.value = false
  applicationError.value = ''
  showApplicationModal.value = true
}

// 關閉申請對話框
function closeApplicationModal() {
  showApplicationModal.value = false
  applicationError.value = ''
}

// 提交申請
async function submitApplication() {
  if (!animal.value || !agreeTerms.value) return
  
  isSubmitting.value = true
  applicationError.value = ''
  
  try {
    // 生成 Idempotency-Key 避免重複提交
    const idempotencyKey = `apply-${animal.value.animal_id}-${Date.now()}`
    
    await createApplication(
      {
        animal_id: animal.value.animal_id,
        type: applicationForm.value.type
      },
      idempotencyKey
    )
    
    // 成功後關閉對話框並導向我的申請
    showApplicationModal.value = false
    router.push('/my/applications')
  } catch (err: any) {
    console.error('Submit application error:', err)
    if (err.response?.status === 400) {
      applicationError.value = err.response.data.message || '申請失敗,請檢查您的資料'
    } else if (err.response?.status === 409) {
      applicationError.value = '您已經申請過此動物了'
    } else {
      applicationError.value = '提交失敗,請稍後再試'
    }
  } finally {
    isSubmitting.value = false
  }
}

// 前往登入
function goToLogin() {
  router.push({ name: 'Login', query: { redirect: route.fullPath } })
}

// 前往編輯
function goToEdit() {
  if (!animal.value) return
  // 導向到「我的送養」頁面,用戶可以在那裡編輯
  router.push('/my-rehomes')
}

// 初始載入
onMounted(() => {
  loadAnimal()
})
</script>
