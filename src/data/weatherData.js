// type: 'mountain'(산간·산불) / 'coastal'(해안·침수) / 'default'(일반)
export const weatherList = [
  { id: 'wl_01', name: '서울', type: 'default', temp: 27, humidity: 42, wind: 3.2, rain: 0 },
  { id: 'wl_02', name: '수원', type: 'default', temp: 26, humidity: 55, wind: 2.1, rain: 2 },
  { id: 'wl_03', name: '대전', type: 'default', temp: 24, humidity: 38, wind: 5.6, rain: 0 },
  {
    id: 'wl_04',
    name: '고성 산간',
    type: 'mountain',
    temp: 29,
    humidity: 32,
    wind: 5.2,
    rain: 0,
    effHumidity: 28,
  },
  {
    id: 'wl_05',
    name: '지리산',
    type: 'mountain',
    temp: 28,
    humidity: 35,
    wind: 4.5,
    rain: 0,
    effHumidity: 30,
  },
  {
    id: 'wl_06',
    name: '부산',
    type: 'coastal',
    temp: 25,
    humidity: 61,
    wind: 4.8,
    rain: 12,
    highTide: '14:30',
  },
  {
    id: 'wl_07',
    name: '강릉 해안',
    type: 'coastal',
    temp: 23,
    humidity: 70,
    wind: 5.1,
    rain: 20,
    highTide: '09:10',
  },
]

export const categoryLabel = {
  all: '전체',
  mountain: '산간',
  coastal: '해안',
  default: '일반',
}