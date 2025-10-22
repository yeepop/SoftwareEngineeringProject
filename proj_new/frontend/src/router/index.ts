import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 頁面懶加載
const Home = () => import('@/pages/Home.vue')
const Animals = () => import('@/pages/Animals.vue')
const AnimalDetail = () => import('@/pages/AnimalDetail.vue')
const Login = () => import('@/pages/Login.vue')
const Register = () => import('@/pages/Register.vue')
const MyApplications = () => import('@/pages/MyApplications.vue')
const MyRehomes = () => import('@/pages/MyRehomes.vue')
const RehomeForm = () => import('@/pages/RehomeForm.vue')
const ShelterDashboard = () => import('@/pages/ShelterDashboard.vue')
const AdminDashboard = () => import('@/pages/AdminDashboard.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首頁' }
  },
  {
    path: '/animals',
    name: 'Animals',
    component: Animals,
    meta: { title: '動物列表' }
  },
  {
    path: '/animals/:id',
    name: 'AnimalDetail',
    component: AnimalDetail,
    meta: { title: '動物詳情' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登入', guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: '註冊', guest: true }
  },
  {
    path: '/my/applications',
    name: 'MyApplications',
    component: MyApplications,
    meta: { title: '我的申請', requiresAuth: true }
  },
  {
    path: '/my/rehomes',
    name: 'MyRehomes',
    component: MyRehomes,
    meta: { title: '我的送養', requiresAuth: true }
  },
  {
    path: '/rehomes/new',
    name: 'RehomeForm',
    component: RehomeForm,
    meta: { title: '發佈送養', requiresAuth: true }
  },
  {
    path: '/shelter/dashboard',
    name: 'ShelterDashboard',
    component: ShelterDashboard,
    meta: { title: '收容所管理', requiresAuth: true, requiresRole: 'SHELTER_MEMBER' }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { title: '管理後台', requiresAuth: true, requiresRole: 'ADMIN' }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守衛
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 設定頁面標題
  if (to.meta.title) {
    document.title = `${to.meta.title} - 貓狗領養平台`
  }
  
  // 檢查是否需要登入
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // 檢查角色權限
  if (to.meta.requiresRole && authStore.user?.role !== to.meta.requiresRole) {
    next({ name: 'Home' })
    return
  }
  
  // 已登入使用者不能訪問登入/註冊頁面
  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'Home' })
    return
  }
  
  next()
})

export default router
