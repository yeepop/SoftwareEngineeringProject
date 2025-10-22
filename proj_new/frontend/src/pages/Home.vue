<template>
  <div class="home min-h-screen">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-5xl font-bold mb-6">貓狗領養平台</h1>
        <p class="text-xl mb-8">給牠們一個溫暖的家，讓愛延續</p>
        <router-link
          to="/animals"
          class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          開始尋找
        </router-link>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">平台特色</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="text-4xl mb-4">🐕</div>
            <h3 class="text-xl font-semibold mb-2">豐富的動物資訊</h3>
            <p class="text-gray-600">詳細的動物資料、健康紀錄與照片</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="text-4xl mb-4">🏥</div>
            <h3 class="text-xl font-semibold mb-2">完整醫療紀錄</h3>
            <p class="text-gray-600">疫苗、健檢、治療等完整記錄</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="text-4xl mb-4">💝</div>
            <h3 class="text-xl font-semibold mb-2">簡化申請流程</h3>
            <p class="text-gray-600">線上申請、即時追蹤申請狀態</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-6">準備好開始了嗎？</h2>
        <p class="text-xl text-gray-600 mb-8">立即註冊，開始尋找您的毛小孩</p>
        <div class="space-x-4">
          <router-link
            to="/register"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            立即註冊
          </router-link>
          <router-link
            to="/login"
            class="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            登入
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Home page component
</script>

<style scoped>
.home {
  /* Add custom styles if needed */
}
</style>
