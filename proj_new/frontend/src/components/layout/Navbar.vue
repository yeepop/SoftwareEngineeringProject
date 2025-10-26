<template>
  <nav class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo & Brand -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2">
            <span class="text-2xl">🐾</span>
            <span class="text-xl font-bold text-gray-900">貓狗領養平台</span>
          </router-link>
        </div>

        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link
            to="/"
            class="text-gray-700 hover:text-blue-600 transition"
            active-class="text-blue-600 font-semibold"
          >
            首頁
          </router-link>
          <router-link
            to="/animals"
            class="text-gray-700 hover:text-blue-600 transition"
            active-class="text-blue-600 font-semibold"
          >
            尋找動物
          </router-link>

          <!-- 未登入狀態 -->
          <template v-if="!authStore.isAuthenticated">
            <router-link
              to="/login"
              class="text-gray-700 hover:text-blue-600 transition"
              active-class="text-blue-600 font-semibold"
            >
              登入
            </router-link>
            <router-link
              to="/register"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              註冊
            </router-link>
          </template>

          <!-- 已登入狀態 -->
          <template v-else>
            <router-link
              to="/rehome-form"
              class="text-gray-700 hover:text-blue-600 transition"
              active-class="text-blue-600 font-semibold"
            >
              送養
            </router-link>
            <router-link
              to="/my-rehomes"
              class="text-gray-700 hover:text-blue-600 transition"
              active-class="text-blue-600 font-semibold"
            >
              我的送養
            </router-link>
            <router-link
              to="/my/applications"
              class="text-gray-700 hover:text-blue-600 transition"
              active-class="text-blue-600 font-semibold"
            >
              我的申請
            </router-link>

            <!-- 通知鈴鐺 -->
            <NotificationBell />

            <!-- 用戶選單 -->
            <div class="relative" ref="userMenuRef">
              <button
                @click="toggleUserMenu"
                class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition"
              >
                <span class="text-xl">👤</span>
                <span>{{ authStore.user?.username || authStore.user?.email }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- 下拉選單 -->
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              >
                <div class="px-4 py-2 border-b border-gray-200">
                  <p class="text-sm text-gray-500">已登入為</p>
                  <p class="text-sm font-semibold text-gray-900 truncate">
                    {{ authStore.user?.email }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ getRoleText(authStore.user?.role) }}
                  </p>
                </div>

                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  👤 個人資料
                </router-link>

                <router-link
                  v-if="authStore.user?.role === 'SHELTER_MEMBER'"
                  to="/shelter/dashboard"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  收容所管理
                </router-link>

                <router-link
                  v-if="authStore.user?.role === 'ADMIN'"
                  to="/admin/dashboard"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  管理後台
                </router-link>

                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  登出
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <button
            @click="toggleMobileMenu"
            class="text-gray-700 hover:text-blue-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                v-if="!showMobileMenu"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <router-link
          to="/"
          class="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
          @click="showMobileMenu = false"
        >
          首頁
        </router-link>
        <router-link
          to="/animals"
          class="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
          @click="showMobileMenu = false"
        >
          尋找動物
        </router-link>

        <template v-if="!authStore.isAuthenticated">
          <router-link
            to="/login"
            class="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            @click="showMobileMenu = false"
          >
            登入
          </router-link>
          <router-link
            to="/register"
            class="block px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            @click="showMobileMenu = false"
          >
            註冊
          </router-link>
        </template>

        <template v-else>
          <div class="px-3 py-2 border-b border-gray-200">
            <p class="text-sm text-gray-500">已登入為</p>
            <p class="font-semibold text-gray-900">{{ authStore.user?.username || authStore.user?.email }}</p>
          </div>
          <router-link
            to="/profile"
            class="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            @click="showMobileMenu = false"
          >
            👤 個人資料
          </router-link>
          <router-link
            to="/rehome-form"
            class="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            @click="showMobileMenu = false"
          >
            送養
          </router-link>
          <router-link
            to="/my-rehomes"
            class="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            @click="showMobileMenu = false"
          >
            我的送養
          </router-link>
          <router-link
            to="/my/applications"
            class="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            @click="showMobileMenu = false"
          >
            我的申請
          </router-link>
          <router-link
            v-if="authStore.user?.role === 'SHELTER_MEMBER'"
            to="/shelter/dashboard"
            class="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            @click="showMobileMenu = false"
          >
            收容所管理
          </router-link>
          <router-link
            v-if="authStore.user?.role === 'ADMIN'"
            to="/admin/dashboard"
            class="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            @click="showMobileMenu = false"
          >
            管理後台
          </router-link>
          <button
            @click="handleLogout"
            class="block w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-gray-100"
          >
            登出
          </button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NotificationBell from '@/components/NotificationBell.vue'

const router = useRouter()
const authStore = useAuthStore()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const userMenuRef = ref<HTMLElement>()

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function getRoleText(role?: string): string {
  const roleMap: Record<string, string> = {
    ADMIN: '管理員',
    SHELTER_MEMBER: '收容所成員',
    GENERAL_MEMBER: '一般會員',
  }
  return role ? roleMap[role] || role : ''
}

async function handleLogout() {
  showUserMenu.value = false
  showMobileMenu.value = false
  await authStore.logout()
  router.push('/')
}

// 點擊外部關閉用戶選單
function handleClickOutside(event: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
