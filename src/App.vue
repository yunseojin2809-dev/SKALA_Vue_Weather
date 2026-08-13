<script setup>
import UnitToggler from './components/UnitToggler.vue'
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <!-- 이미지 로고 적용 -->
      <RouterLink to="/intro" class="brand">
        <img src="/logo.png" alt="불물조심 로고" class="logo-img" />
      </RouterLink>
      <UnitToggler />
    </header>

    <main class="main-area">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  max-width: 1280px;
  margin: 0 auto;
}

.brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  background: transparent; /* 흰색 상자 제거! */
  padding: 0;
  border-radius: 0;
  box-shadow: none;
}

.brand:hover {
  transform: scale(1.02);
}

/* 로고 이미지 크기 정돈 */
.logo-img {
  height: 36px;
  width: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4)); /* 자연스러운 그림자 */
}

.main-area {
  width: 100%;
}
</style>