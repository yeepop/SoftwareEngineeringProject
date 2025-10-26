<template>
  <div class="shelter-dashboard">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">收容所管理</h1>

      <!-- 快速連結 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          @click="router.push('/admin/applications')"
          class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-left"
        >
          <div class="flex items-center gap-3">
            <div class="text-4xl">📋</div>
            <div>
              <p class="text-lg font-semibold text-gray-900">申請審核管理</p>
              <p class="text-sm text-gray-600">審核領養申請</p>
            </div>
          </div>
        </button>

        <button
          @click="router.push('/medical-records')"
          class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-left"
        >
          <div class="flex items-center gap-3">
            <div class="text-4xl">🏥</div>
            <div>
              <p class="text-lg font-semibold text-gray-900">醫療記錄管理</p>
              <p class="text-sm text-gray-600">管理動物醫療記錄</p>
            </div>
          </div>
        </button>

        <button
          @click="router.push('/my-rehomes')"
          class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-left"
        >
          <div class="flex items-center gap-3">
            <div class="text-4xl">🐾</div>
            <div>
              <p class="text-lg font-semibold text-gray-900">我的送養</p>
              <p class="text-sm text-gray-600">管理送養動物</p>
            </div>
          </div>
        </button>
      </div>

      <div class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-gray-600">更多功能開發中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
