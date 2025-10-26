<template>
  <div class="rehome-form-page max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">
      {{ isEditMode ? '編輯送養資訊' : '刊登送養資訊' }}
    </h1>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- 步驟指示器 -->
      <div class="steps flex items-center justify-between mb-8">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step-item flex items-center"
          :class="{ active: currentStep === index, completed: currentStep > index }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <span class="step-label ml-2">{{ step }}</span>
          <div v-if="index < steps.length - 1" class="step-line"></div>
        </div>
      </div>

      <!-- 步驟 1: 基本資訊 -->
      <div v-show="currentStep === 0" class="form-section">
        <h2 class="text-xl font-semibold mb-4">動物基本資訊</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required">名稱</label>
            <input
              v-model="formData.name"
              type="text"
              class="form-input"
              placeholder="例: 小白"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label required">物種</label>
            <select v-model="formData.species" class="form-input" required>
              <option value="">請選擇</option>
              <option value="CAT">貓</option>
              <option value="DOG">狗</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">品種</label>
            <input
              v-model="formData.breed"
              type="text"
              class="form-input"
              placeholder="例: 米克斯"
            />
          </div>

          <div class="form-group">
            <label class="form-label required">性別</label>
            <select v-model="formData.sex" class="form-input" required>
              <option value="">請選擇</option>
              <option value="MALE">公</option>
              <option value="FEMALE">母</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">出生日期</label>
            <input
              v-model="formData.date_of_birth"
              type="date"
              class="form-input"
              :max="today"
            />
          </div>

          <div class="form-group">
            <label class="form-label">顏色</label>
            <input
              v-model="formData.color"
              type="text"
              class="form-input"
              placeholder="例: 白色、橘色"
            />
          </div>
        </div>

        <div class="form-group mt-4">
          <label class="form-label required">描述</label>
          <textarea
            v-model="formData.description"
            class="form-input"
            rows="4"
            placeholder="請描述動物的個性、習慣、特徵等..."
            required
          ></textarea>
        </div>
      </div>

      <!-- 步驟 2: 照片上傳 -->
      <div v-show="currentStep === 1" class="form-section">
        <h2 class="text-xl font-semibold mb-4">上傳照片</h2>
        <p class="text-gray-600 mb-4">
          {{ isEditMode ? '選擇新照片替換現有照片(選填,送出時會自動上傳)' : '請選擇清晰的動物照片,至少一張 (送出時會自動上傳)' }}
        </p>
        
        <!-- 現有照片 (編輯模式) -->
        <div v-if="isEditMode && uploadedPhotos.length > 0" class="mb-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">現有照片</h3>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="(photo, index) in uploadedPhotos" :key="index" class="relative">
              <img :src="photo.url" :alt="`Photo ${index + 1}`" class="w-full h-24 object-cover rounded" />
            </div>
          </div>
        </div>
        
        <FileUploader
          ref="fileUploader"
          accept="image/*"
          :multiple="true"
          :max-size="5 * 1024 * 1024"
          :auto-upload="false"
          @uploaded="onPhotosUploaded"
          @error="onUploadError"
        />

        <div v-if="fileUploader?.files && fileUploader.files.length > 0" class="mt-4">
          <p class="text-sm text-green-600">✓ 已選擇 {{ fileUploader.files.length }} 張新照片</p>
          <p class="text-xs text-gray-500">注意:這些照片會在步驟4確認送出時一併上傳</p>
        </div>
      </div>

      <!-- 步驟 3: 醫療資訊 -->
      <div v-show="currentStep === 2" class="form-section">
        <h2 class="text-xl font-semibold mb-4">醫療資訊 (選填)</h2>
        
        <div class="form-group">
          <label class="form-label">醫療摘要</label>
          <textarea
            v-model="formData.medical_summary"
            class="form-input"
            rows="4"
            placeholder="例: 已完成疫苗接種、已結紮、有無疾病史等..."
          ></textarea>
        </div>

        <div class="form-group mt-4">
          <label class="flex items-center">
            <input
              v-model="formData.is_neutered"
              type="checkbox"
              class="mr-2"
            />
            <span>已結紮</span>
          </label>
        </div>
      </div>

      <!-- 步驟 4: 確認送出 -->
      <div v-show="currentStep === 3" class="form-section">
        <h2 class="text-xl font-semibold mb-4">確認資訊</h2>
        
        <div class="preview-card">
          <div class="preview-section">
            <h3 class="font-semibold mb-2">基本資訊</h3>
            <div class="preview-grid">
              <div><span class="text-gray-600">名稱:</span> {{ formData.name }}</div>
              <div><span class="text-gray-600">物種:</span> {{ speciesText }}</div>
              <div><span class="text-gray-600">品種:</span> {{ formData.breed || '未提供' }}</div>
              <div><span class="text-gray-600">性別:</span> {{ sexText }}</div>
              <div><span class="text-gray-600">出生日期:</span> {{ formData.date_of_birth || '未提供' }}</div>
              <div><span class="text-gray-600">顏色:</span> {{ formData.color || '未提供' }}</div>
            </div>
            <p class="mt-2"><span class="text-gray-600">描述:</span> {{ formData.description }}</p>
          </div>

          <div class="preview-section mt-4">
            <h3 class="font-semibold mb-2">照片</h3>
            <div v-if="isEditMode && uploadedPhotos.length > 0">
              <p class="text-sm text-gray-600">現有照片: {{ uploadedPhotos.length }} 張</p>
            </div>
            <div v-if="fileUploader?.files?.length">
              <p class="text-sm" :class="isEditMode ? 'text-blue-600' : 'text-green-600'">
                {{ isEditMode ? '將新增' : '已選擇' }} {{ fileUploader.files.length }} 張照片
              </p>
            </div>
            <p v-if="!fileUploader?.files?.length && !uploadedPhotos.length" class="text-sm text-red-600">
              尚未選擇照片
            </p>
          </div>

          <div v-if="formData.medical_summary" class="preview-section mt-4">
            <h3 class="font-semibold mb-2">醫療資訊</h3>
            <p>{{ formData.medical_summary }}</p>
            <p v-if="formData.is_neutered" class="text-green-600 mt-1">✓ 已結紮</p>
          </div>
        </div>

        <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p class="text-sm text-blue-800">
            <strong>注意:</strong> 送出後資訊將進入審核,審核通過後才會公開顯示。
          </p>
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>

      <!-- 按鈕群組 -->
      <div class="form-actions flex justify-between">
        <button
          v-if="currentStep > 0"
          type="button"
          class="btn-secondary"
          @click="prevStep"
        >
          上一步
        </button>
        <div v-else></div>

        <div class="flex gap-2">
          <button
            type="button"
            class="btn-secondary"
            @click="saveDraft"
            :disabled="isSubmitting"
          >
            儲存草稿
          </button>
          
          <button
            v-if="currentStep < steps.length - 1"
            type="button"
            class="btn-primary"
            @click="nextStep"
          >
            下一步
          </button>
          
          <button
            v-else
            type="submit"
            class="btn-primary"
            :disabled="isSubmitting || (!isEditMode && !fileUploader?.files?.length && !uploadedPhotos.length)"
          >
            {{ isSubmitting ? '送出中...' : isEditMode ? '儲存修改' : '確認送出' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { createAnimal, getAnimal, updateAnimal, addAnimalImage } from '@/api/animals'
import { useUpload } from '@/composables/useUpload'
import FileUploader from '@/components/uploads/FileUploader.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const steps = ['基本資訊', '上傳照片', '醫療資訊', '確認送出']
const currentStep = ref(0)
const isSubmitting = ref(false)
const errorMessage = ref('')
const isEditMode = ref(false)
const editingAnimalId = ref<number | null>(null)

const fileUploader = ref<InstanceType<typeof FileUploader>>()
const uploadedPhotos = ref<any[]>([])

const today = new Date().toISOString().split('T')[0]

const formData = reactive<{
  name: string
  species: 'CAT' | 'DOG' | ''
  breed: string
  sex: 'MALE' | 'FEMALE' | ''
  date_of_birth: string
  color: string
  description: string
  medical_summary: string
  is_neutered: boolean
  source_type: 'PERSONAL'
}>({
  name: '',
  species: '',
  breed: '',
  sex: '',
  date_of_birth: '',
  color: '',
  description: '',
  medical_summary: '',
  is_neutered: false,
  source_type: 'PERSONAL',
})

const speciesText = computed(() => {
  return formData.species === 'CAT' ? '貓' : formData.species === 'DOG' ? '狗' : ''
})

const sexText = computed(() => {
  return formData.sex === 'MALE' ? '公' : formData.sex === 'FEMALE' ? '母' : ''
})

onMounted(async () => {
  // 檢查是否已登入
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  // 檢查是否為編輯模式
  const animalId = route.query.id
  if (animalId) {
    isEditMode.value = true
    editingAnimalId.value = Number(animalId)
    await loadAnimalData(Number(animalId))
  } else {
    // 新增模式：嘗試從 localStorage 載入草稿
    loadDraft()
  }
})

async function loadAnimalData(id: number) {
  try {
    const animal = await getAnimal(id)
    
    // 填充表單資料
    formData.name = animal.name || ''
    formData.species = animal.species || ''
    formData.breed = animal.breed || ''
    formData.sex = (animal.sex === 'MALE' || animal.sex === 'FEMALE') ? animal.sex : ''
    formData.date_of_birth = animal.dob || ''
    formData.color = '' // 後端沒有這個欄位,保持空白
    formData.description = animal.description || ''
    formData.medical_summary = animal.medical_summary || ''
    formData.is_neutered = false // 後端沒有這個欄位
    
    // 如果有圖片,顯示現有圖片
    if (animal.images && animal.images.length > 0) {
      uploadedPhotos.value = animal.images
    }
  } catch (error: any) {
    console.error('Load animal error:', error)
    errorMessage.value = '載入動物資料失敗'
    setTimeout(() => router.push('/my-rehomes'), 2000)
  }
}

function nextStep() {
  // 驗證當前步驟
  if (currentStep.value === 0) {
    if (!formData.name || !formData.species || !formData.sex || !formData.description) {
      errorMessage.value = '請填寫所有必填欄位'
      return
    }
  }

  if (currentStep.value === 1) {
    // 檢查 FileUploader 中的檔案
    const uploaderFiles = fileUploader.value?.files || []
    // 新增模式必須有照片,編輯模式可以沒有(使用現有照片)
    if (!isEditMode.value && uploaderFiles.length === 0 && uploadedPhotos.value.length === 0) {
      errorMessage.value = '請至少選擇一張照片'
      return
    }
  }

  errorMessage.value = ''
  currentStep.value++
}

function prevStep() {
  currentStep.value--
  errorMessage.value = ''
}

function onPhotosUploaded(photos: any[]) {
  uploadedPhotos.value = photos
  console.log('Photos uploaded:', photos)
}

function onUploadError(error: string) {
  errorMessage.value = error
}

function saveDraft() {
  const draft = {
    formData: { ...formData },
    uploadedPhotos: uploadedPhotos.value,
    currentStep: currentStep.value,
  }
  localStorage.setItem('rehome_draft', JSON.stringify(draft))
  alert('草稿已儲存')
}

function loadDraft() {
  const draftStr = localStorage.getItem('rehome_draft')
  if (!draftStr) return

  try {
    const draft = JSON.parse(draftStr)
    Object.assign(formData, draft.formData)
    uploadedPhotos.value = draft.uploadedPhotos || []
    currentStep.value = draft.currentStep || 0
  } catch (error) {
    console.error('載入草稿失敗:', error)
  }
}

async function handleSubmit() {
  // 檢查 FileUploader 中的檔案
  const uploaderFiles = fileUploader.value?.files || []
  
  // 編輯模式可以沒有新照片(使用現有照片)
  if (!isEditMode.value && uploaderFiles.length === 0) {
    errorMessage.value = '請至少選擇一張照片'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // 步驟 1: 準備動物資料
    const animalData = {
      name: formData.name,
      species: formData.species as 'CAT' | 'DOG',
      breed: formData.breed || undefined,
      sex: formData.sex as 'MALE' | 'FEMALE',
      date_of_birth: formData.date_of_birth || undefined,
      color: formData.color || undefined,
      description: formData.description,
      medical_summary: formData.medical_summary || undefined,
      is_neutered: formData.is_neutered,
      source_type: 'PERSONAL' as const,
      status: 'DRAFT' as const,
    }

    let animalId: number

    // 步驟 2: 建立或更新動物記錄
    if (isEditMode.value && editingAnimalId.value) {
      // 更新模式
      const result = await updateAnimal(editingAnimalId.value, animalData)
      animalId = result.animal.animal_id
    } else {
      // 新增模式
      const result = await createAnimal(animalData)
      animalId = result.animal.animal_id
    }

    // 步驟 3: 上傳新照片 (如果有)
    if (uploaderFiles.length > 0) {
      try {
        const { uploadMultiple } = useUpload()
        const files = uploaderFiles.map(item => item.file)
        const uploadResults = await uploadMultiple(files, 'ANIMAL', animalId)
        
        // 將上傳的圖片 URL 添加到 animal_images 表
        for (const result of uploadResults) {
          await addAnimalImage(animalId, { 
            image_url: result.url,
            storage_key: result.storage_key,
            mime_type: result.mime_type
          })
        }
      } catch (uploadError) {
        console.error('Photo upload error:', uploadError)
        alert('動物資訊已儲存,但照片上傳失敗。您可以稍後在編輯頁面重新上傳照片。')
      }
    }
    
    // 清除草稿
    localStorage.removeItem('rehome_draft')

    // 導向到我的送養列表
    const message = isEditMode.value ? '送養資訊已更新成功!' : '送養資訊已建立成功!'
    alert(message)
    router.push('/my-rehomes')
  } catch (error: any) {
    console.error('Submit error:', error)
    errorMessage.value = error.response?.data?.message || '送出失敗,請稍後再試'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.rehome-form-page {
  min-height: calc(100vh - 4rem);
}

.steps {
  position: relative;
  padding: 2rem 0;
}

.step-item {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  z-index: 1;
}

.step-item.active .step-number {
  background-color: #3b82f6;
  color: white;
}

.step-item.completed .step-number {
  background-color: #10b981;
  color: white;
}

.step-label {
  font-weight: 500;
  color: #6b7280;
}

.step-item.active .step-label {
  color: #3b82f6;
}

.step-item.completed .step-label {
  color: #10b981;
}

.step-line {
  flex: 1;
  height: 2px;
  background-color: #e5e7eb;
  margin: 0 1rem;
}

.step-item.completed .step-line {
  background-color: #10b981;
}

.form-section {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.preview-card {
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.preview-section {
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.preview-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.alert {
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
}

.alert-error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.form-actions {
  margin-top: 2rem;
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.625rem 1.5rem;
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.btn-secondary:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

/* 隱藏 FileUploader 中的"開始上傳"按鈕 */
.form-section :deep(.file-uploader .actions) {
  display: none;
}
</style>
