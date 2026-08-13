<script setup>
import { computed } from 'vue'
import { riskOf, scoreOf, weatherIcon } from '../composables/useRisk.js'
import { useConfigStore } from '../stores/configStore'

const props = defineProps({
  target: { type: Object, required: true },
  categoryLabel: { type: Object, required: true }
})

const emit = defineEmits(['delete'])

const configStore = useConfigStore()

const risk = computed(() => riskOf(props.target))
const score = computed(() => scoreOf(props.target))
const icon = computed(() => weatherIcon(props.target))
const windKmh = computed(() => Math.round(props.target.wind * 3.6))

const displayTemp = computed(() => {
  const raw = props.target.temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((raw * 9) / 5 + 32)
  }
  return raw
})

const now = new Date()
const timeLabel = `${now.getMonth() + 1}월 ${now.getDate()}일 ${String(now.getHours()).padStart(2, '0')}:${String(
  now.getMinutes()
).padStart(2, '0')}`
</script>

<template>
  <div class="weather-detail-card">
    <div class="card-header">
      <div>
        <div class="title-row">
          <h1 class="city-title">{{ target.name }}</h1>
          <span class="type-tag" :class="target.type">{{ categoryLabel[target.type] }}</span>
        </div>
        <div class="update-meta">실시간 관측 · {{ timeLabel }}</div>
      </div>

      <!-- 우측 상단 블록 (삭제 버튼 + 기온) -->
      <div class="header-right-block">
        <button type="button" class="delete-btn" @click="emit('delete', target.id)">
          🗑️ 삭제하기
        </button>

        <div class="main-temp-block">
          <span class="emoji">{{ icon }}</span>
          <span class="temp-num">{{ displayTemp }}</span>
          <span class="temp-unit">{{ configStore.unitSymbol }}</span>
        </div>
      </div>
    </div>

    <hr class="divider" />

    <!-- 위험 등급 상태 알림 -->
    <div class="risk-banner" :class="risk ? risk.key : 'normal'">
      <div class="risk-text">
        <h3>{{ risk ? risk.text : '정상 관측 구역' }}</h3>
        <p>{{ risk ? '재해 위험도가 모니터링 중입니다.' : '위험 요인 없음 · 실시간 날씨만 제공되는 지역입니다.' }}</p>
      </div>
      <div v-if="risk" class="risk-badge">위험점수 {{ score }}점</div>
    </div>

    <!-- 세부 지표 그리드 -->
    <div class="metrics-grid">
      <div class="metric-item">
        <span class="m-label">💧 습도</span>
        <span class="m-val">{{ target.humidity }}%</span>
      </div>
      <div class="metric-item">
        <span class="m-label">🌬️ 풍속</span>
        <span class="m-val">{{ windKmh }} km/h</span>
      </div>
      <div class="metric-item">
        <span class="m-label">🌧️ 강수량</span>
        <span class="m-val">{{ target.rain || 0 }} mm</span>
      </div>
      <div class="metric-item">
        <span class="m-label">🌡️ 기온</span>
        <span class="m-val">{{ displayTemp }}{{ configStore.unitSymbol }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-detail-card {
  background: var(--card-bg, #ffffff);
  border-radius: var(--radius-lg, 24px);
  padding: 32px;
  box-shadow: var(--shadow-card, 0 10px 30px rgba(0, 0, 0, 0.05));
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid var(--line, #f1f5f9);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.city-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0;
}

.type-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  background: #f1f5f9;
}
.type-tag.mountain { background: rgba(255, 159, 28, 0.15); color: #d97706; }
.type-tag.coastal { background: rgba(56, 189, 248, 0.15); color: #0284c7; }

.update-meta {
  font-size: 13px;
  color: var(--text-secondary, #94a3b8);
  margin-top: 6px;
}

/* 우측 상단 삭제 버튼 + 날씨 온도 영역 스타일 */
.header-right-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.delete-btn {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.delete-btn:hover {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
}

.main-temp-block {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.main-temp-block .emoji { font-size: 38px; }
.main-temp-block .temp-num { font-size: 52px; font-weight: 900; line-height: 1; }
.main-temp-block .temp-unit { font-size: 20px; color: var(--text-secondary, #64748b); }

.divider {
  border: none;
  border-top: 1px solid var(--line, #f1f5f9);
  margin: 24px 0;
}

.risk-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-radius: 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  margin-bottom: 24px;
}

.risk-banner.severe, .risk-banner.warning {
  background: #fef2f2;
  border-color: #fecaca;
}

.risk-text h3 { margin: 0 0 4px; font-size: 16px; font-weight: 800; }
.risk-text p { margin: 0; font-size: 13px; color: #64748b; }

.risk-badge {
  font-size: 13px;
  font-weight: 700;
  color: #dc2626;
  background: #ffffff;
  padding: 6px 12px;
  border-radius: 100px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.metric-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 16px 12px;
  border-radius: 14px;
  text-align: center;
}

.m-label { font-size: 12px; color: #64748b; margin-bottom: 4px; display: block; }
.m-val { font-size: 16px; font-weight: 800; }

@media (max-width: 640px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .card-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .header-right-block { align-items: flex-start; }
}
</style>