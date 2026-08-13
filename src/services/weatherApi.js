import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
})

/**
 * 도시 이름으로 현재 날씨를 조회한다.
 * .env 에 VITE_OPENWEATHER_API_KEY 가 없으면 null을 반환하고
 * 호출부는 기존 Mock 데이터(weatherData.js)로 자연스럽게 대체한다.
 */
export const fetchCurrentWeather = async (cityName) => {
  if (!API_KEY) {
    console.warn('[weatherApi] VITE_OPENWEATHER_API_KEY 미설정 - Mock 데이터를 사용합니다.')
    return null
  }

  try {
    const { data } = await client.get('/weather', {
      params: { q: cityName, appid: API_KEY, units: 'metric', lang: 'kr' },
    })
    return {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      wind: data.wind.speed,
      status: data.weather?.[0]?.description ?? '',
    }
  } catch (err) {
    console.error('[weatherApi] 날씨 조회 실패:', err.message)
    return null
  }
}

/**
 * 위도/경도 기반 5일 예보 조회 (기타 외부 API 확장 예시)
 */
export const fetchForecast = async (lat, lon) => {
  if (!API_KEY) return null

  try {
    const { data } = await client.get('/forecast', {
      params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'kr' },
    })
    return data.list
  } catch (err) {
    console.error('[weatherApi] 예보 조회 실패:', err.message)
    return null
  }
}
