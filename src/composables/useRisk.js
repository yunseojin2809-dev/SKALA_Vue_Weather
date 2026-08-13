// 산불 위험도 (산간 지역) - 수치 가중치 완화 (현실적인 산림청 지수 적용)
export function wildfireScore(s) {
  const humidityFactor = (100 - (s.humidity || 50)) * 0.3
  const effHumidityFactor = s.effHumidity && s.effHumidity < 35 ? (35 - s.effHumidity) * 0.8 : 0
  const windFactor = (s.wind || 0) * 2.2
  const tempFactor = s.temp >= 28 ? (s.temp - 28) * 1.5 : 0
  const raw = humidityFactor + effHumidityFactor + windFactor + tempFactor
  return Math.max(0, Math.min(100, Math.round(raw)))
}

export function wildfireLevel(score) {
  if (score >= 80) return { key: 'severe', label: '심각', text: '산불 심각' }
  if (score >= 60) return { key: 'warning', label: '경계', text: '산불 경계' }
  if (score >= 40) return { key: 'caution', label: '주의', text: '산불 주의' }
  return { key: 'attention', label: '관심', text: '산불 관심' }
}

// 만조 시각과 현재 시각의 근접도 보너스
export function tideProximityBonus(highTide) {
  if (!highTide) return 0
  const [h, m] = highTide.split(':').map(Number)
  const now = new Date()
  const tideMinutes = h * 60 + m
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  let diff = Math.abs(tideMinutes - nowMinutes)
  diff = Math.min(diff, 1440 - diff) / 60

  if (diff <= 1) return 15
  if (diff <= 3) return 8
  return 0
}

// 침수 위험도 (해안 지역)
export function floodScore(s) {
  const rainFactor = (s.rain || 0) * 1.1
  const windFactor = (s.wind || 0) * 1.8
  const tideBonus = tideProximityBonus(s.highTide)
  const raw = rainFactor + windFactor + tideBonus
  return Math.max(0, Math.min(100, Math.round(raw)))
}

export function floodLevel(score) {
  if (score >= 75) return { key: 'severe', label: '심각', text: '침수 심각' }
  if (score >= 55) return { key: 'warning', label: '경계', text: '침수 경계' }
  if (score >= 35) return { key: 'caution', label: '주의', text: '침수 주의' }
  return { key: 'attention', label: '관심', text: '침수 관심' }
}

export const levelColorVar = {
  attention: 'var(--c-attention)',
  caution: 'var(--c-caution)',
  warning: 'var(--c-warning)',
  severe: 'var(--c-severe)',
}

export function riskOf(s) {
  if (!s) return null
  if (s.type === 'mountain') return wildfireLevel(wildfireScore(s))
  if (s.type === 'coastal') return floodLevel(floodScore(s))
  return null
}

export function scoreOf(s) {
  if (!s) return null
  if (s.type === 'mountain') return wildfireScore(s)
  if (s.type === 'coastal') return floodScore(s)
  return null
}

export function weatherIcon(s) {
  if (!s) return '☀️'
  if (s.rain >= 20) return '🌧️'
  if (s.rain > 0) return '⛅'
  if (s.humidity >= 60) return '☁️'
  return '☀️'
}