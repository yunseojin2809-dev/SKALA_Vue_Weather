<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { weatherList } from '../data/weatherData.js'
import { wildfireScore, wildfireLevel, floodScore, floodLevel } from '../composables/useRisk.js'
import { useAuthStore } from '../stores/authStore.js'

const router = useRouter()
const authStore = useAuthStore()

const videoRef = ref(null)
const mapContainer = ref(null)

/* ===== 1. 동적 스태츠 및 지역 선택 상태 ===== */
const totalStationsCount = computed(() => weatherList.length)

// 실시간 심각 등급 지역 개수 자동 산출
const severeCount = computed(() => {
  return weatherList.filter((w) => {
    if (w.type === 'mountain') return wildfireLevel(wildfireScore(w)).key === 'severe'
    if (w.type === 'coastal') return floodLevel(floodScore(w)).key === 'severe'
    return false
  }).length
})

const selectedStationId = ref('goseong')

// 관측소별 상세 지표
const stationDetailData = {
  goseong: {
    name: '고성 산간',
    alertText: '🚨 산불 경계',
    temp: 29,
    sky: '맑음 / 강풍 주의',
    feelsLike: 31,
    wind: '5.2m/s',
    humidity: '32%',
    vis: '15km',
    press: '1012 hPa',
    uv: '8 (매우높음)',
    pop: '0%',
    hourly: [
      { time: '06시', temp: 22, pop: '10%', icon: '🌤️' },
      { time: '09시', temp: 25, pop: '10%', icon: '☀️' },
      { time: '12시', temp: 29, pop: '20%', icon: '☀️' },
      { time: '15시', temp: 31, pop: '30%', icon: '🌤️' },
      { time: '18시', temp: 28, pop: '10%', icon: '🌤️' },
      { time: '21시', temp: 25, pop: '0%', icon: '🌙' },
    ]
  },
  seoul: {
    name: '서울 관측소',
    alertText: '✅ 정상 관측',
    temp: 27,
    sky: '맑음',
    feelsLike: 28,
    wind: '3.2m/s',
    humidity: '42%',
    vis: '20km',
    press: '1015 hPa',
    uv: '6 (높음)',
    pop: '10%',
    hourly: [
      { time: '06시', temp: 21, pop: '0%', icon: '🌤️' },
      { time: '09시', temp: 24, pop: '0%', icon: '☀️' },
      { time: '12시', temp: 27, pop: '10%', icon: '☀️' },
      { time: '15시', temp: 28, pop: '10%', icon: '☀️' },
      { time: '18시', temp: 26, pop: '0%', icon: '🌤️' },
      { time: '21시', temp: 23, pop: '0%', icon: '🌙' },
    ]
  },
  jirisan: {
    name: '지리산 국립공원',
    alertText: '🚨 산불 경계',
    temp: 28,
    sky: '건조 주의',
    feelsLike: 30,
    wind: '4.5m/s',
    humidity: '35%',
    vis: '12km',
    press: '1008 hPa',
    uv: '9 (매우높음)',
    pop: '0%',
    hourly: [
      { time: '06시', temp: 23, pop: '0%', icon: '☀️' },
      { time: '09시', temp: 27, pop: '0%', icon: '☀️' },
      { time: '12시', temp: 28, pop: '10%', icon: '☀️' },
      { time: '15시', temp: 30, pop: '10%', icon: '☀️' },
      { time: '18시', temp: 29, pop: '0%', icon: '🌤️' },
      { time: '21시', temp: 26, pop: '0%', icon: '🌙' },
    ]
  },
  busan: {
    name: '부산 해안',
    alertText: '🌊 침수 주의',
    temp: 25,
    sky: '흐림 / 만조 주의',
    feelsLike: 27,
    wind: '4.8m/s',
    humidity: '61%',
    vis: '10km',
    press: '1010 hPa',
    uv: '4 (보통)',
    pop: '60%',
    hourly: [
      { time: '06시', temp: 22, pop: '40%', icon: '🌧️' },
      { time: '09시', temp: 24, pop: '50%', icon: '🌧️' },
      { time: '12시', temp: 25, pop: '60%', icon: '🌧️' },
      { time: '15시', temp: 26, pop: '40%', icon: '🌦️' },
      { time: '18시', temp: 25, pop: '20%', icon: '☁️' },
      { time: '21시', temp: 24, pop: '10%', icon: '🌙' },
    ]
  }
}

const currentData = computed(() => stationDetailData[selectedStationId.value] || stationDetailData.goseong)

/* ===== 2. SVG 기온 곡선 차트 좌표 ===== */
const svgPath = computed(() => {
  const hourly = currentData.value.hourly
  const temps = hourly.map(h => h.temp)
  const minTemp = Math.min(...temps) - 2
  const maxTemp = Math.max(...temps) + 2
  
  const points = hourly.map((h, i) => {
    const x = 50 + i * 100
    const y = 70 - ((h.temp - minTemp) / (maxTemp - minTemp)) * 50
    return { x, y }
  })

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2
    const yc = (points[i].y + points[i + 1].y) / 2
    d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`
  }
  d += ` T ${points[points.length - 1].x} ${points[points.length - 1].y}`
  return { d, points }
})

/* ===== 3. 비디오 & Leaflet 지도 초기화 ===== */
onMounted(() => {
  if (videoRef.value) {
    videoRef.value.playbackRate = 0.5
  }

  if (window.L && mapContainer.value) {
    const map = window.L.map(mapContainer.value).setView([36.3, 127.8], 7)

    const darkMap = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; CARTO'
    })

    const satelliteMap = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: '&copy; Esri'
    })

    const osmMap = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap'
    })

    darkMap.addTo(map)

    const API_KEY = '8964edc63b366d27b5b728b7976570b7'

    const windLayer = window.L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`)
    const precipitationLayer = window.L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`)
    const cloudsLayer = window.L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`)

    const baseMaps = {
      '🌙 다크 테마': darkMap,
      '🛰️ 위성 지도': satelliteMap,
      '🗺️ 일반 지도': osmMap
    }

    const overlayMaps = {
      '🍃 바람(풍속) 레이어': windLayer,
      '🌧️ 강수량 레이어': precipitationLayer,
      '☁️ 구름 레이어': cloudsLayer
    }

    window.L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(map)

    const stations = [
      { title: '서울 (27°C) [정상]', lat: 37.5665, lng: 126.9780 },
      { title: '고성 산간 (29°C) [경계]', lat: 38.3805, lng: 128.4677 },
      { title: '지리산 (28°C) [경계]', lat: 35.3370, lng: 127.7306 },
      { title: '부산 🌊 (25°C) [주의]', lat: 35.1796, lng: 129.0756 },
    ]

    stations.forEach(s => {
      window.L.marker([s.lat, s.lng])
        .addTo(map)
        .bindPopup(`<b>${s.title}</b>`)
    })
  }
})

const scrollToContent = (elementId) => {
  const target = document.getElementById(elementId)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="intro-container">
    <!-- 상단 우측 관제자 프로필 및 로그인 영역 (App.vue 상단 네비바의 단위변환 버튼과 어우러지도록 배치) -->
    <div class="top-nav-bar">
      <div class="nav-auth-wrap">
        <button v-if="!authStore.isLoggedIn" class="btn-nav-login" @click="router.push('/login')">
          관제자 로그인 🔓
        </button>
        <div v-else class="user-profile-badge">
          <span>👨‍💻 {{ authStore.username }}님</span>
          <button class="btn-nav-logout" @click="authStore.logout()">로그아웃</button>
        </div>
      </div>
    </div>

    <!-- 1. 히어로 섹션 -->
    <section class="hero-wrapper">
      <video
        ref="videoRef"
        class="bg-video"
        autoplay
        loop
        muted
        playsinline
        src="/hero-bg.mp4"
      ></video>
      <div class="video-overlay"></div>

      <div class="hero-content">
        <div class="badge">
          <span class="pulse-dot"></span> 실시간 산불 · 침수 재해 모니터링
        </div>

        <h1 class="hero-title">
          Empowering Safety <br />
          <span class="gradient-text">With Real-Time Weather</span>
        </h1>

        <p class="hero-subtitle">
          전국 {{ totalStationsCount }}개 관측소의 기상 데이터를 실시간으로 수집하고 분석하여<br />
          산불 및 침수 위험도를 한눈에 파악할 수 있는 지능형 재해 예보 플랫폼
        </p>

        <div class="cta-group">
          <button class="btn-main" @click="router.push('/about')">
            대시보드 바로가기 📊
          </button>
          <button class="btn-sub" @click="scrollToContent('forecast-dashboard')">
            상세 예보 둘러보기 ↓
          </button>
        </div>

        <!-- 스태츠 카드 동적 연동 -->
        <div class="hero-stats">
          <div class="stat-box">
            <div class="stat-val">{{ totalStationsCount }}<small>개소</small></div>
            <div class="stat-lbl">실시간 관측소</div>
          </div>
          <div class="stat-box alert">
            <div class="stat-val">{{ severeCount }}<small>곳</small></div>
            <div class="stat-lbl">심각 위험 경보 🚨</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">24시</div>
            <div class="stat-lbl">실시간 모니터링</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. 실시간 기상 개요 및 예보 섹션 -->
    <section id="forecast-dashboard" class="content-section">
      <div class="section-inner">
        <div class="section-title-wrap">
          <h2>Weather Overview</h2>
          <p>전국 주요 관측소 실시간 기상 지표 및 시간별 예보</p>
        </div>

        <div class="forecast-grid">
          <!-- 선택 관측소 실시간 지표 -->
          <div class="main-weather-card">
            <div class="card-header">
              <div class="location-select-wrap">
                📍 
                <select v-model="selectedStationId" class="station-select">
                  <option value="goseong">고성 산간</option>
                  <option value="seoul">서울 관측소</option>
                  <option value="jirisan">지리산 국립공원</option>
                  <option value="busan">부산 해안</option>
                </select>
              </div>
              <span class="alert-tag" :class="{ 'is-normal': currentData.alertText.includes('정상') }">
                {{ currentData.alertText }}
              </span>
            </div>
            
            <div class="temp-display">
              <div class="temp-num">{{ currentData.temp }}°</div>
              <div class="weather-info">
                <div class="sky-text">{{ currentData.sky }}</div>
                <div class="feels-like">체감 온도 {{ currentData.feelsLike }}° · 16:00 기준</div>
              </div>
            </div>

            <div class="metrics-grid">
              <div class="metric-item">
                <span class="m-label">🍃 풍속</span>
                <span class="m-val">{{ currentData.wind }}</span>
              </div>
              <div class="metric-item">
                <span class="m-label">💧 습도</span>
                <span class="m-val">{{ currentData.humidity }}</span>
              </div>
              <div class="metric-item">
                <span class="m-label">👁️ 시야</span>
                <span class="m-val">{{ currentData.vis }}</span>
              </div>
              <div class="metric-item">
                <span class="m-label">🌡️ 기압</span>
                <span class="m-val">{{ currentData.press }}</span>
              </div>
              <div class="metric-item">
                <span class="m-label">☀️ 자외선</span>
                <span class="m-val">{{ currentData.uv }}</span>
              </div>
              <div class="metric-item">
                <span class="m-label">🌧️ 강수확률</span>
                <span class="m-val">{{ currentData.pop }}</span>
              </div>
            </div>
          </div>

          <!-- 곡선 예보 그래프 카드 -->
          <div class="hourly-forecast-card">
            <h3>Hourly Forecast ({{ currentData.name }} 시간별 기온)</h3>
            
            <div class="graph-box">
              <svg viewBox="0 0 600 90" class="curve-chart">
                <path :d="svgPath.d" fill="none" stroke="url(#tempGradient)" stroke-width="4" stroke-linecap="round" />
                <circle
                  v-for="(p, idx) in svgPath.points"
                  :key="idx"
                  :cx="p.x"
                  :cy="p.y"
                  r="5"
                  fill="#ff6b35"
                  stroke="#ffffff"
                  stroke-width="2"
                />
                <defs>
                  <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#ff8c42" />
                    <stop offset="50%" stop-color="#ff6b35" />
                    <stop offset="100%" stop-color="#38bdf8" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div class="hourly-list">
              <div v-for="h in currentData.hourly" :key="h.time" class="hour-item">
                <div class="h-time">{{ h.time }}</div>
                <div class="h-icon">{{ h.icon }}</div>
                <div class="h-temp">{{ h.temp }}°</div>
                <div class="h-pop">{{ h.pop }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 시스템 특징 안내 -->
        <div id="service-info" class="service-info-section">
          <div class="info-header">
            <h2>System Features &amp; Architecture</h2>
            <p>지능형 재해 예보 시스템의 핵심 기술 및 산출 수식 안내</p>
          </div>

          <div class="info-grid">
            <!-- 1. 산불 위험 지수 카드 -->
            <div class="info-card">
              <div class="info-icon">🔥</div>
              <h3>산불 위험 지수 알고리즘</h3>
              <div class="formula-badge">
                <code>Score = (100 - 습도)×0.3 + 실효습도 보정 + 풍속×2.2 + 고온 가중치</code>
              </div>
              <p class="card-desc">
                산림청 산불위험예보 기준을 모티브로 상대습도·실효습도(35% 미만)·풍속·고온(28°C 이상) 기상 지표를 결합하여 4단계(관심·주의·경계·심각) 등급을 산출합니다.
              </p>
            </div>

            <!-- 2. 침수 위험 지수 카드 -->
            <div class="info-card">
              <div class="info-icon">🌊</div>
              <h3>침수 위험 지수 알고리즘</h3>
              <div class="formula-badge">
                <code>Score = 강수량×1.1 + 풍속×1.8 + 만조 근접 보너스(최대 +15점)</code>
              </div>
              <p class="card-desc">
                기상청 해일·강수 관측 기준을 바탕으로 시우량과 풍속에 만조 시각 오차(1~3시간 내)에 따른 조석(Tide) 가중치를 가산하여 해안 및 도심 침수를 모니터링합니다.
              </p>
            </div>

            <!-- 3. 관측소 자동 판별 카드 -->
            <div class="info-card">
              <div class="info-icon">📡</div>
              <h3>관측소 맞춤형 자동 판별</h3>
              <div class="formula-badge">
                <code>riskOf(station) ➔ Type-Based Engine</code>
              </div>
              <p class="card-desc">
                전국 관측소 유형(산간·해안·도심)을 자동 식별하고, 해당 지역 특성에 맞는 위험도 엔진을 실시간으로 추적·갱신하여 정확한 재해 정보를 제공합니다.
              </p>
            </div>
          </div>
        </div>

        <!-- 4. 지도 섹션 -->
        <div class="map-section">
          <div class="map-header">
            <h3>Interactive Disaster Map</h3>
            <p>실시간 대한민국 주요 재해 관측소 위치 매핑</p>
          </div>

          <div ref="mapContainer" class="easy-leaflet-map"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.intro-container {
  position: relative;
  width: 100%;
  background: #0f172a;
}

/* 상단 프로필/로그인 배지 위치 */
.top-nav-bar {
  position: absolute !important;
  top: 20px !important;
  right: 20px !important;
  z-index: 100 !important;
}

.nav-auth-wrap {
  display: flex !important;
  align-items: center !important;
}

.btn-nav-login {
  background: rgba(255, 107, 53, 0.2);
  border: 1px solid #ff6b35;
  color: #ff6b35;
  padding: 8px 18px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-nav-login:hover {
  background: #ff6b35;
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
}

.user-profile-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 13px;
  color: #ffffff;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}

.btn-nav-logout {
  background: rgba(239, 68, 68, 0.25);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #ef4444;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.btn-nav-logout:hover {
  background: #ef4444;
  color: #ffffff;
}

.hero-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 720px;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.bg-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  transform: translate(-50%, -50%);
  object-fit: cover;
  z-index: 1;
}

.video-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, 0.4) 0%,
    rgba(15, 23, 42, 0.75) 60%,
    rgba(15, 23, 42, 0.98) 100%
  );
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  max-width: 960px;
  width: 100%;
  padding: 0 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #ff9f1c;
  background: rgba(255, 159, 28, 0.18);
  border: 1px solid rgba(255, 159, 28, 0.4);
  padding: 8px 18px;
  border-radius: 100px;
  margin-bottom: 28px;
  backdrop-filter: blur(8px);
}

.pulse-dot {
  width: 7px;
  height: 7px;
  background: #ff9f1c;
  border-radius: 50%;
  box-shadow: 0 0 10px #ff9f1c;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.hero-title {
  font-size: 56px;
  font-weight: 900;
  line-height: 1.15;
  margin: 0 0 20px;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.gradient-text {
  background: linear-gradient(90deg, #ffffff 0%, #ff6b35 50%, #ff9f1c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 16px;
  line-height: 1.65;
  color: rgba(241, 245, 249, 0.9);
  margin-bottom: 40px;
  max-width: 680px;
}

.cta-group {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 60px;
}

.btn-main {
  border: none;
  background: var(--accent-orange, #ff6b35);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  padding: 18px 38px;
  border-radius: 100px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(255, 107, 53, 0.4);
  transition: all 0.25s ease;
}

.btn-main:hover { transform: translateY(-3px); }

.btn-sub {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 16px;
  font-weight: 700;
  padding: 18px 32px;
  border-radius: 100px;
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition: all 0.25s ease;
}

.btn-sub:hover { background: rgba(255, 255, 255, 0.22); }

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 760px;
}

.stat-box {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 20px 16px;
  border-radius: 20px;
  backdrop-filter: blur(16px);
}

.stat-box.alert {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
}

.stat-val { font-size: 30px; font-weight: 900; }
.stat-val small { font-size: 14px; margin-left: 2px; }
.stat-box.alert .stat-val { color: #ef4444; }
.stat-lbl { font-size: 12px; color: rgba(255, 255, 255, 0.75); margin-top: 4px; }

/* 본문 스타일 */
.content-section {
  width: 100%;
  padding: 80px 24px 120px;
  background: #0f172a;
  color: #ffffff;
  display: flex;
  justify-content: center;
}

.section-inner {
  max-width: 1180px;
  width: 100%;
}

.section-title-wrap { margin-bottom: 36px; }
.section-title-wrap h2 { font-size: 32px; font-weight: 800; margin: 0 0 8px; }
.section-title-wrap p { color: #94a3b8; font-size: 15px; }

.forecast-grid {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 24px;
  margin-bottom: 60px;
}

.main-weather-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 28px;
  backdrop-filter: blur(12px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.location-select-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 800;
  color: #f1f5f9;
}

.station-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 700;
  outline: none;
  cursor: pointer;
}

.station-select option {
  background: #0f172a;
  color: #ffffff;
}

.alert-tag {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 100px;
}

.alert-tag.is-normal {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.4);
}

.temp-display {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.temp-num { font-size: 64px; font-weight: 900; line-height: 1; }
.sky-text { font-size: 18px; font-weight: 700; }
.feels-like { font-size: 13px; color: #94a3b8; margin-top: 4px; }

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.metric-item {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 12px 14px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.m-label { font-size: 12px; color: #94a3b8; }
.m-val { font-size: 14px; font-weight: 700; }

.hourly-forecast-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 28px;
  display: flex;
  flex-direction: column;
}

.hourly-forecast-card h3 { font-size: 18px; font-weight: 700; margin: 0 0 20px; }

.graph-box {
  width: 100%;
  height: 90px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  margin-bottom: 24px;
  position: relative;
  display: flex;
  align-items: center;
}

.curve-chart {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.hourly-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.hour-item {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 14px 8px;
  text-align: center;
}

.h-time { font-size: 12px; color: #94a3b8; }
.h-icon { font-size: 20px; margin: 8px 0; }
.h-temp { font-size: 16px; font-weight: 800; }
.h-pop { font-size: 11px; color: #38bdf8; margin-top: 4px; }

.service-info-section { margin-bottom: 60px; }
.info-header { margin-bottom: 24px; }
.info-header h2 { font-size: 26px; font-weight: 800; margin: 0 0 6px; }
.info-header p { color: #94a3b8; font-size: 14px; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.info-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
}

.info-icon { font-size: 32px; margin-bottom: 12px; }
.info-card h3 { font-size: 18px; font-weight: 700; margin: 0 0 8px; }

.formula-badge {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 10px 12px;
  margin: 12px 0 16px;
  text-align: left;
}

.formula-badge code {
  color: #ff9f1c;
  font-family: 'Fira Code', Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
  word-break: break-all;
  display: block;
}

.card-desc {
  font-size: 13px !important;
  color: #94a3b8 !important;
  line-height: 1.65 !important;
  margin: 0 !important;
  text-align: left;
}

.map-section { width: 100%; }
.map-header { margin-bottom: 20px; }
.map-header h3 { font-size: 22px; font-weight: 800; margin: 0 0 4px; }
.map-header p { font-size: 14px; color: #94a3b8; }

.easy-leaflet-map {
  width: 100%;
  height: 480px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  z-index: 1;
}

:deep(.leaflet-control-layers) {
  background: rgba(15, 23, 42, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  padding: 8px 12px !important;
  backdrop-filter: blur(8px);
}

:deep(.leaflet-control-layers-toggle) {
  filter: invert(1);
}

@media (max-width: 900px) {
  .forecast-grid, .info-grid { grid-template-columns: 1fr; }
  .hourly-list { grid-template-columns: repeat(3, 1fr); gap: 12px; }
}
</style>