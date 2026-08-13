<!-- src/views/LoginView.vue -->
<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const isAgreed = ref(false) // 🌟 이용약관 동의 스위치 상태
const errorMessage = ref('')

const handleLogin = () => {
  if (!username.value || !password.value) {
    errorMessage.value = '아이디와 비밀번호를 모두 입력해 주세요.'
    return
  }

  // 🌟 이용약관 동의 미체크 시 방어 로직
  if (!isAgreed.value) {
    errorMessage.value = '이용약관 및 개인정보 처리방침에 동의해 주세요.'
    return
  }

  const success = authStore.login(username.value, password.value)
  if (success) {
    // 가던 길(또는 대시보드)로 진입
    const redirectPath = route.query.redirect || '/dashboard'
    router.push(redirectPath)
  } else {
    errorMessage.value = '로그인 실패! 아이디/비밀번호를 확인해 주세요.'
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 🏠 홈으로 돌아가기 버튼 -->
      <button class="btn-back-home" @click="router.push('/')">
        ← 홈(인트로)으로 돌아가기
      </button>

      <div class="login-header">
        <span class="logo-emoji">🚨</span>
        <h2>관제 시스템 로그인</h2>
        <p>실시간 관측소 설정 및 지수 관리 권한 인증</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label>관제자 ID</label>
          <input 
            type="text" 
            v-model="username" 
            placeholder="아이디 입력 (예: skala)"
          />
        </div>

        <div class="input-group">
          <label>비밀번호</label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="비밀번호 입력 (예: skala)"
          />
        </div>

        <!--  이용약관 동의 토글 스위치 -->
        <div class="agree-group">
          <span class="agree-text">이용약관 및 정보 제공에 동의합니다</span>
          <label class="toggle-switch">
            <input type="checkbox" v-model="isAgreed" />
            <span class="slider"></span>
          </label>
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <button type="submit" class="btn-login">
          인증 및 대시보드 접속 🔓
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>

.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
  z-index: 100;
  padding: 20px;
  box-sizing: border-box;
}

.login-card {
  position: relative;
  max-width: 440px;
  width: 100%;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  padding: 36px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.btn-back-home {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 0;
  display: block;
  transition: color 0.2s ease;
}

.btn-back-home:hover {
  color: #ffffff;
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo-emoji {
  font-size: 36px;
  display: block;
  margin-bottom: 8px;
}

.login-header h2 {
  font-size: 22px;
  font-weight: 800;
  color: #f8fafc;
  margin: 0 0 6px;
}

.login-header p {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.input-group label {
  font-size: 13px;
  font-weight: 700;
  color: #cbd5e1;
}

.input-group input {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 14px 16px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.input-group input:focus {
  border-color: #ff6b35;
}

/* 🌟 이용약관 스위치 스타일 🌟 */
.agree-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.agree-text {
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 600;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #334155;
  transition: 0.3s;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 2px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #ff6b35; /* 오렌지 포인트 레몬/네온 */
}

input:checked + .slider:before {
  transform: translateX(18px);
}

.error-text {
  color: #ef4444;
  font-size: 13px;
  margin: 0;
  text-align: left;
}

.btn-login {
  border: none;
  background: #ff6b35;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  padding: 16px;
  border-radius: 100px;
  cursor: pointer;
  margin-top: 4px;
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.35);
  transition: all 0.2s ease;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(255, 107, 53, 0.5);
}
</style>