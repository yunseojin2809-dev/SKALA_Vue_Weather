import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

const routes = [
  {
    // 첫 접속(/) 시 동영상 인트로 화면으로 바로 진입
    path: '/',
    name: 'weather-intro',
    component: () => import('../views/WeatherIntroView.vue'),
  },
  {
    // 서비스 소개
    path: '/about',
    name: 'weather-about',
    component: () => import('../views/WeatherAboutView.vue'),
  },
  {
    // 로그인 화면
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    // 메인 날씨 대시보드 (🔒 로그인 한 사람만 접근 가능)
    path: '/dashboard',
    name: 'weather-home',
    component: () => import('../views/WeatherHomeView.vue'),
    meta: { requiresAuth: true }, 
  },
  {
    // 상세 페이지 (🔒 로그인 한 사람만)
    path: '/weather/:cityId',
    name: 'weather-detail',
    component: () => import('../views/WeatherDetailView.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    // Catch-all Route
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 🔒 라우터 가드
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 1. 인증이 필요한 페이지 접근 시 비로그인이면 경고 후 바로 /login으로 이동
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    alert('🚨 대시보드는 관제자 인증(로그인)이 필요합니다.')
    next({ name: 'login', query: { redirect: to.fullPath } })
  } 
  // 2. 이미 로그인했으면 /login 접근 시 대시보드로 이동
  else if (to.name === 'login' && authStore.isLoggedIn) {
    next({ name: 'weather-home' })
  } 
  else {
    next()
  }
})

export default router