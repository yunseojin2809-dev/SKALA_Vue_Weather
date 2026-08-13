<template>
  <div class="about-container">
    <div class="about-card">
      <h2 class="title">🖥️ 서비스 소개</h2>
      <p class="desc">
        본 앱은 Vue 3, Vue Router, Pinia 기반으로 제작된 실습용 재해·날씨 대시보드입니다.
      </p>

      <ul class="feature-list">
        <li><code>components/</code> 폴더 내부의 독립 부품 컴포넌트 연동</li>
        <li>클라이언트 사이드 라우팅을 통한 새로고침 없는 화면 전환</li>
        <li>산간 지역의 산불 위험도, 해안 지역의 침수 위험도 자동 계산</li>
        <li>Pinia 스토어를 통한 섭씨/화씨 단위 전역 상태 관리</li>
        <li>Axios 기반 OpenWeatherMap 연동 준비 (키 없으면 Mock 데이터 사용)</li>
      </ul>

      <!-- 대시보드로 진입하는 최종 CTA 버튼 -->
      <button class="cta-btn" @click="$router.push('/dashboard')">
        실시간 재해 대시보드 시작하기 🚀
      </button>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.about-card {
  max-width: 680px;
  width: 100%;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--line, #002570);
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.389);
}

.title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 14px;
  color: var(--text-primary, #000000);
}

.desc {
  font-size: 15px;
  color: var(--text-secondary, #1d2125);
  line-height: 1.6;
  margin-bottom: 28px;
}

.feature-list {
  list-style: disc;
  padding-left: 20px;
  margin-bottom: 36px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 14px;
  color: var(--text-secondary, #001a3f);
  line-height: 1.5;
}

.feature-list code {
  color: #eb5757;
  background: rgba(135, 131, 120, 0.15); 
  padding: 2px 6px; 
  border-radius: 4px;
  font-family: 'Fira Code', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 85%; 
  font-weight: 600;
}

.cta-btn {
  width: 100%;
  border: none;
  background: var(--accent-orange, #ff6b35);
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  padding: 18px 24px;
  border-radius: 100px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(255, 107, 53, 0.3);
  transition: all 0.25s ease;
}

.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(255, 107, 53, 0.4);
}
</style>