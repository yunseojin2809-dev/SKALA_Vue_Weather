// src/stores/authStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 1. State: 로컬스토리지 연동
  const token = ref(localStorage.getItem('userToken') || null)
  const user = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  // 2. Getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => user.value?.name || '관리자')

  // 3. Actions: 로그인/로그아웃
  function login(usernameInput, passwordInput) {
    // 실습용 가상 인증 처리 (원래는 백엔드 API 통신)
    if (usernameInput && passwordInput) {
      const mockToken = 'mock-jwt-token-12345'
      const mockUser = { id: 'admin_01', name: usernameInput, role: 'Disaster_Manager' }

      token.value = mockToken
      user.value = mockUser

      localStorage.setItem('userToken', mockToken)
      localStorage.setItem('userInfo', JSON.stringify(mockUser))
      return true
    }
    return false
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('userToken')
    localStorage.removeItem('userInfo')
  }

  return { token, user, isLoggedIn, username, login, logout }
})