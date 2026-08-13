<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="not-found-card">
      <div class="emoji-row">☀️❓</div>
      <h2>페이지를 찾을 수 없습니다.</h2>
      <p>요청하신 주소가 존재하지 않거나, 아직 개발되지 않았습니다.</p>
      <button class="cta" @click="router.push('/')">날씨 메인으로 이동</button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  padding-top: 30px;
}
.not-found-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 34px 24px;
  text-align: center;
  box-shadow: var(--shadow-card);
  max-width: 320px;
}
.emoji-row { font-size: 40px; margin-bottom: 10px; }
h2 { font-size: 18px; margin: 0 0 8px; }
p { font-size: 13px; color: var(--text-secondary); margin: 0 0 20px; line-height: 1.6; }
.cta {
  border: none;
  background: var(--accent-orange);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  cursor: pointer;
  width: 100%;
}
</style>
