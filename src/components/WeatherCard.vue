<script setup>
import { computed } from 'vue'
import { riskOf, scoreOf, weatherIcon } from '../composables/useRisk.js'
import { useConfigStore } from '../stores/configStore'

const props = defineProps({
  station: { type: Object, required: true },
  categoryLabel: { type: Object, required: true },
  isSelected: { type: Boolean, default: false } // 선택 여부 프로퍼티 추가
})
const emit = defineEmits(['select', 'detail'])

const configStore = useConfigStore()

const risk = computed(() => riskOf(props.station))
const score = computed(() => scoreOf(props.station))
const icon = computed(() => weatherIcon(props.station))
const windKmh = computed(() => Math.round(props.station.wind * 3.6))

// 메인 카드에 단위 설정(섭씨/화씨) 변경 적용
const displayTemp = computed(() => {
  const rawTemp = props.station.temp // 원본 데이터는 섭씨 숫자
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
})

const now = new Date()
const timeLabel = `${now.getMonth() + 1}월 ${now.getDate()}일 ${String(now.getHours()).padStart(2, '0')}:${String(
  now.getMinutes()
).padStart(2, '0')}`

// 상세 요인 칩 (지역 타입별로 다르게 구성) - 기온도 단위 변환 반영
const factorChips = computed(() => {
  const s = props.station
  const tempStr = `${displayTemp.value}°`
  if (s.type === 'mountain') {
    return [
      { label: '습도', value: `${s.humidity}%`, icon: '💧' },
      { label: '실효습도', value: `${s.effHumidity}%`, icon: '🍂' },
      { label: '풍속', value: `${windKmh.value}km/h`, icon: '🌬️' },
      { label: '기온', value: tempStr, icon: '🌡️' },
    ]
  }
  if (s.type === 'coastal') {
    return [
      { label: '강수량', value: `${s.rain}mm`, icon: '🌧️' },
      { label: '풍속', value: `${windKmh.value}km/h`, icon: '🌬️' },
      { label: '만조', value: s.highTide, icon: '🌊' },
      { label: '기온', value: tempStr, icon: '🌡️' },
    ]
  }
  return [
    { label: '습도', value: `${s.humidity}%`, icon: '💧' },
    { label: '풍속', value: `${windKmh.value}km/h`, icon: '🌬️' },
    { label: '강수량', value: `${s.rain}mm`, icon: '🌧️' },
    { label: '기온', value: tempStr, icon: '🌡️' },
  ]
})
</script>

<template>
  <div
    class="weather-card"
    :class="{ 'is-selected': isSelected }"
    @click="emit('select', station.name)"
  >
    <div class="card-header">
      <div>
        <div class="city-name">
          {{ station.name }}
          <span class="type-tag" :class="station.type">{{ categoryLabel[station.type] }}</span>
        </div>
        <div class="update-meta">실시간 관측 · {{ timeLabel }}</div>
      </div>
      <button class="detail-btn" @click.stop="emit('detail', station)">상세보기</button>
    </div>

    <div class="main-row">
      <div class="temp-icon-block">
        <span class="weather-emoji">{{ icon }}</span>
        <span class="temp-num">{{ displayTemp }}</span>
        <span class="temp-unit">{{ configStore.unitSymbol }}</span>
      </div>

      <div class="stat-block">
        <div>풍속: {{ windKmh }} km/h</div>
        <div>습도: {{ station.humidity }}%</div>
      </div>
    </div>

    <div class="summary-line">
      <template v-if="risk">
        <span class="risk-dot" :class="risk.key"></span>{{ risk.text }} · {{ timeLabel }}
      </template>
      <template v-else> {{ icon === '☀️' ? '맑음' : icon === '🌧️' ? '비' : '흐림' }} · {{ timeLabel }} </template>
    </div>

    <div class="factor-strip">
      <div v-for="(f, idx) in factorChips" :key="f.label" class="factor-chip" :class="{ today: idx === 0 }">
        <div class="factor-label">{{ f.label }}</div>
        <div class="factor-icon">{{ f.icon }}</div>
        <div class="factor-value">{{ f.value }}</div>
      </div>
    </div>

    <div v-if="risk" class="gauge-row">
      <div class="gauge-track">
        <div class="gauge-fill" :class="risk.key" :style="{ width: score + '%' }"></div>
      </div>
      <span class="gauge-score" :class="risk.key">{{ score }}</span>
    </div>
  </div>
</template>

<style scoped>
.weather-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 18px 18px 14px;
  cursor: pointer;
  border: 1px solid #e2e8f0; 
  box-shadow: 
    0 10px 25px -5px rgba(15, 23, 42, 0.1),
    0 8px 10px -6px rgba(15, 23, 42, 0.06); 
  transition: all 0.25s ease;
}

/* 카드 선택 하이라이트 효과 */
.weather-card.is-selected {
  border-color: #ff6b35 !important;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.2), 0 10px 25px rgba(0, 0, 0, 0.08) !important;
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.city-name {
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.update-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 3px;
}
.type-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 100px;
}
.type-tag.mountain { background: rgba(255, 149, 0, 0.12); color: var(--c-warning); }
.type-tag.coastal { background: rgba(74, 144, 217, 0.14); color: var(--accent-blue); }
.type-tag.default { background: rgba(142, 142, 147, 0.12); color: var(--text-secondary); }

.detail-btn {
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--text);
  font-size: 12px;
  padding: 7px 12px;
  border-radius: 100px;
  cursor: pointer;
  white-space: nowrap;
}
.detail-btn:hover { background: var(--line); }

.main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
}
.temp-icon-block {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.weather-emoji {
  font-size: 30px;
  margin-right: 4px;
}
.temp-num {
  font-size: 42px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
}
.temp-unit {
  font-size: 16px;
  color: var(--text-secondary);
}
.stat-block {
  text-align: right;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.summary-line {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}
.risk-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.risk-dot.attention { background: var(--c-attention); }
.risk-dot.caution { background: var(--c-caution); }
.risk-dot.warning { background: var(--c-warning); }
.risk-dot.severe { background: var(--c-severe); }

.factor-strip {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
  overflow-x: auto;
}
.factor-chip {
  flex: 1;
  min-width: 64px;
  text-align: center;
  padding: 8px 4px;
  border-radius: var(--radius-sm);
}
.factor-chip.today {
  box-shadow: inset 0 2px 0 var(--accent-orange);
}
.factor-label {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.factor-icon {
  font-size: 15px;
  margin-bottom: 4px;
}
.factor-value {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
}

.gauge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}
.gauge-track {
  flex: 1;
  height: 6px;
  border-radius: 100px;
  background: var(--line);
  overflow: hidden;
}
.gauge-fill {
  height: 100%;
  border-radius: 100px;
}
.gauge-fill.attention { background: var(--c-attention); }
.gauge-fill.caution { background: var(--c-caution); }
.gauge-fill.warning { background: var(--c-warning); }
.gauge-fill.severe { background: var(--c-severe); }
.gauge-score {
  font-size: 12px;
  font-weight: 700;
  min-width: 24px;
  text-align: right;
}
.gauge-score.attention { color: var(--c-attention); }
.gauge-score.caution { color: #b58900; }
.gauge-score.warning { color: var(--c-warning); }
.gauge-score.severe { color: var(--c-severe); }
</style>