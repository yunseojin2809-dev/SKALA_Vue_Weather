<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { weatherList, categoryLabel } from '../data/weatherData.js'
import WeatherDetailCard from '../components/WeatherDetailCard.vue'

const props = defineProps({
  cityId: { type: String, required: true },
})

const router = useRouter()
const station = ref(null)

onMounted(() => {
  station.value = weatherList.find((s) => String(s.id) === String(props.cityId)) || null
})

// 메인 대시보드로 이동하는 안전한 네비게이션 함수
const goToDashboard = () => {
  router.push('/dashboard').catch(() => {
    router.push('/')
  })
}

// 관측소 삭제 처리 함수 (weatherList 배열에서 실제로 제거)
const handleDeleteLocation = (id) => {
  if (!confirm('정말 이 관측소 데이터를 삭제하시겠습니까?')) return

  // 1. weatherList 배열에서 삭제할 아이템의 인덱스 검색
  const index = weatherList.findIndex((s) => String(s.id) === String(id))

  if (index !== -1) {
    // 2. 배열에서 해당 항목 삭제
    weatherList.splice(index, 1)
    alert('관측소가 정상적으로 삭제되었습니다.')
    goToDashboard()
  } else {
    alert('삭제할 관측소 정보를 찾을 수 없습니다.')
  }
}
</script>

<template>
  <div class="detail-view">
    <div class="detail-container">
      <div class="top-nav">
        <button type="button" class="back-btn" @click="goToDashboard">
          ← 메인 대시보드로 돌아가기
        </button>
      </div>

      <WeatherDetailCard 
        v-if="station" 
        :target="station" 
        :category-label="categoryLabel" 
        @delete="handleDeleteLocation"
      />

      <div v-else class="not-found-inline">
        <p>'{{ cityId }}' 지역 정보를 찾을 수 없습니다.</p>
        <button type="button" class="cta" @click="goToDashboard">대시보드로 돌아가기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-view {
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 20px 80px;
  display: flex;
  justify-content: center;
}

.detail-container {
  max-width: 800px;
  width: 100%;
}

.top-nav {
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
}

.back-btn {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 18px;
  border-radius: 100px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
}

.back-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.not-found-inline {
  background: var(--card-bg, #ffffff);
  border-radius: var(--radius-lg, 20px);
  padding: 40px 20px;
  text-align: center;
  box-shadow: var(--shadow-card, 0 10px 25px rgba(0, 0, 0, 0.05));
}

.not-found-inline p {
  font-size: 15px;
  color: var(--text-secondary, #64748b);
  margin: 0 0 20px;
}

.cta {
  border: none;
  background: var(--accent-orange, #ff6b35);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 100px;
  cursor: pointer;
}
</style>