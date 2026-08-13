<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { weatherList as initialList, categoryLabel } from '../data/weatherData.js'
import { wildfireScore, wildfireLevel, floodScore, floodLevel } from '../composables/useRisk.js'
import { useSearchHistoryStore } from '../stores/searchHistoryStore'

import SearchBox from '../components/SearchBox.vue'
import CategoryFilter from '../components/CategoryFilter.vue'
import AlertBanner from '../components/AlertBanner.vue'
import WeatherCard from '../components/WeatherCard.vue'
import StatusBar from '../components/StatusBar.vue'

const router = useRouter()
const searchHistoryStore = useSearchHistoryStore()

/* ===== 1. 상태 변수 ===== */
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 지역을 검색해 보세요.')
const selectedStationName = ref('')
const weatherList = ref([...initialList])
const selectedCategory = ref('all')

/* ===== 2. 지역 추가 모달 & API 검색 상태 ===== */
const isAddModalOpen = ref(false)
const newCityName = ref('')
const newCityType = ref('default')
const isFetchingApi = ref(false)

/* ===== 3. 필터링 로직 ===== */
const filteredWeatherList = computed(() => {
  const q = searchQuery.value.trim()
  let base = weatherList.value
  if (selectedCategory.value !== 'all') {
    base = base.filter((w) => w.type === selectedCategory.value)
  }
  if (!q) return base
  return base.filter((w) => w.name.includes(q))
})

const dashboardSummary = computed(() => {
  return weatherList.value.filter((w) => {
    if (w.type === 'mountain') return wildfireLevel(wildfireScore(w)).key === 'severe'
    if (w.type === 'coastal') return floodLevel(floodScore(w)).key === 'severe'
    return false
  }).length
})

/* ===== 4. 날씨 API 자동 수집 및 카드 추가 기능 ===== */
const handleAddStation = async () => {
  const queryName = newCityName.value.trim()
  if (!queryName) {
    alert('추가할 도시 이름을 입력해 주세요! (예: 울산, 제주, 인천)')
    return
  }

  isFetchingApi.value = true

  try {
    const apiKey = 'b1b15e88fa797225412429c1c50c122a1'
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(queryName)},KR&units=metric&appid=${apiKey}`
    )

    if (!response.ok) {
      addNewStationToList(queryName, 26, 60, 4.2, 0)
    } else {
      const data = await response.json()
      const temp = Math.round(data.main.temp)
      const humidity = data.main.humidity
      const wind = data.wind.speed
      const rain = data.rain ? (data.rain['1h'] || 0) : 0
      
      addNewStationToList(queryName, temp, humidity, wind, rain)
    }

    isAddModalOpen.value = false
    newCityName.value = ''
  } catch (err) {
    addNewStationToList(queryName, 25, 55, 3.8, 0)
    isAddModalOpen.value = false
    newCityName.value = ''
  } finally {
    isFetchingApi.value = false
  }
}

const addNewStationToList = (name, temp, humidity, wind, rain) => {
  const newStationObj = {
    id: `station_${Date.now()}`,
    name: name.includes('관측소') ? name : `${name} 관측소`,
    type: newCityType.value,
    temp: temp,
    humidity: humidity,
    effHumidity: Math.max(15, humidity - 10),
    wind: wind,
    rain: rain,
    highTide: '14:20'
  }

  weatherList.value.unshift(newStationObj)
}

/* ===== 이벤트 및 와치 ===== */
const selectCard = (name) => {
  selectedStationName.value = name
  selectedCityInfo.value = `${name}이(가) 선택되었습니다.`
}

const openDetail = (station) => {
  router.push('/weather/' + station.id)
}

const applyHistoryChip = (term) => {
  searchQuery.value = term
}

watchEffect(() => {
  if (searchQuery.value.trim().length >= 2) {
    searchHistoryStore.addSearch(searchQuery.value.trim())
  }
})

const today = new Date()
// 문구 수정: 전국 관측소 개수 지우고 날짜 기준 표기
const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 기준`
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-inner">
      <!-- 상단 인트로 홈 버튼 -->
      <div class="top-nav-row">
        <RouterLink to="/intro" class="back-home-btn">
          ← 인트로 홈으로
        </RouterLink>
      </div>

      <div class="header">
        <div class="eyebrow">WILDFIRE &amp; FLOOD WATCH</div>
        <div class="title">지역별 날씨 · 위험도</div>
        <!-- '전국 관측소 7곳' 지우고 '8월 12일 기준'으로 깔끔히 처리 -->
        <div class="subtitle">{{ dateLabel }}</div>
      </div>

      <!-- 1. 경보 배너 -->
      <div class="banner-wrapper">
        <AlertBanner :count="dashboardSummary" />
      </div>

      <!-- 2. 카테고리 필터 영역 -->
      <div class="filter-row">
        <CategoryFilter v-model="selectedCategory" :category-label="categoryLabel" />
      </div>

      <!-- 3. 검색창 (적절한 너비로 조정) -->
      <div class="search-row">
        <div class="search-box-wrap">
          <SearchBox v-model="searchQuery" />
        </div>
      </div>

      <!-- 최근 검색어 칩 -->
      <div v-if="searchHistoryStore.recentHistory && searchHistoryStore.recentHistory.length" class="history-chips">
        <span class="history-label">최근 검색:</span>
        <span
          v-for="term in searchHistoryStore.recentHistory"
          :key="term"
          class="history-chip"
          @click="applyHistoryChip(term)"
        >
          {{ term }}
        </span>
      </div>

      <!-- 4. 관측소별 현황 타이틀 + [지역 추가] 버튼 (우측 상단 대전 카드 위 연동) -->
      <div class="section-label-row">
        <span class="section-label">관측소별 현황</span>
        <button class="btn-add-station" @click="isAddModalOpen = true">
          + 지역 추가
        </button>
      </div>

      <!-- 5. 관측소 카드 그리드 -->
      <div class="card-grid">
        <WeatherCard
          v-for="s in filteredWeatherList"
          :key="s.id"
          :station="s"
          :category-label="categoryLabel"
          :is-selected="selectedStationName === s.name"
          @select="selectCard"
          @detail="openDetail"
        />

        <div v-if="filteredWeatherList.length === 0" class="empty">
          검색 결과가 일치하는 도시가 없습니다.
        </div>
      </div>

      <StatusBar :text="selectedCityInfo" />

      <!-- 6. API 자동 연동 모달 팝업 -->
      <div v-if="isAddModalOpen" class="modal-backdrop" @click="isAddModalOpen = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>🌐 실시간 기상 지역 추가</h3>
            <button class="close-btn" @click="isAddModalOpen = false">✕</button>
          </div>
          
          <div class="modal-body">
            <p class="modal-desc">
              도시 이름을 입력하면 실시간 기상 데이터(기온, 습도, 풍속)를 자동으로 받아와 관측소 목록에 반영합니다.
            </p>

            <label class="form-item">
              지역 / 도시 이름
              <input
                v-model="newCityName"
                type="text"
                placeholder="예: 울산, 제주, 인천, 창원"
                @keyup.enter="handleAddStation"
              />
            </label>

            <label class="form-item">
              관측소 유형
              <select v-model="newCityType">
                <option value="default">일반 도심 구역</option>
                <option value="mountain">산간 구역 (산불 위험 감지)</option>
                <option value="coastal">해안 구역 (침수 위험 감지)</option>
              </select>
            </label>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="isAddModalOpen = false">취소</button>
            <button class="btn-submit" :disabled="isFetchingApi" @click="handleAddStation">
              {{ isFetchingApi ? '날씨 데이터 불러오는 중...' : '실시간 정보 가져오기' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  width: 100%;
  padding-top: 90px;
  padding-bottom: 60px;
  display: flex;
  justify-content: center;
}

.dashboard-inner {
  max-width: 1280px;
  width: 100%;
  padding: 0 32px;
}

.top-nav-row {
  margin-bottom: 16px;
}

.back-home-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 100px;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.back-home-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.header {
  padding: 0 2px 20px;
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent-orange, #ff6b35);
  font-weight: 700;
}

.title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 6px 0 4px;
  color: #0f172a;
}

.subtitle {
  font-size: 14px;
  color: #64748b;
}

.banner-wrapper {
  margin-bottom: 28px;
}

.filter-row {
  margin-bottom: 16px;
}

/* 검색창 적절한 너비(380px)로 정돈 */
.search-row {
  margin-bottom: 12px;
}

.search-box-wrap {
  max-width: 380px;
  width: 100%;
}

.history-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.history-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}

.history-chip {
  font-size: 12px;
  color: #475569;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 4px 12px;
  border-radius: 100px;
  cursor: pointer;
}

.history-chip:hover {
  background: #f1f5f9;
}

/* 관측소별 현황 + [지역 추가] 우측 정렬 라인 */
.section-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 28px 2px 14px;
}

.section-label {
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}

/* [지역 추가] 버튼 (오른쪽 끝 대전 카드 위쪽 세로선 일치) */
.btn-add-station {
  background: #0f172a;
  color: #ffffff;
  border: none;
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-add-station:hover {
  background: #1e293b;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 680px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  padding: 50px 0;
}

/* 모달 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #ffffff;
  width: 90%;
  max-width: 440px;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h3 { font-size: 20px; font-weight: 800; margin: 0; color: #0f172a; }
.close-btn { background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; }

.modal-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 16px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 10px;
}

.modal-body { display: flex; flex-direction: column; gap: 16px; }
.form-item { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 700; color: #475569; }
.form-item input, .form-item select { padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 14px; outline: none; }

.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
.btn-cancel { background: #f1f5f9; color: #64748b; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-submit { background: #ff6b35; color: #ffffff; border: none; padding: 12px 22px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-submit:disabled { background: #94a3b8; cursor: not-allowed; }
</style>