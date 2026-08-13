import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    unit: 'celsius', // 초기값: celsius
  }),

  getters: {
    // 현재 단위 상태에 맞는 기호 (°C / °F)
    unitSymbol: (state) => (state.unit === 'celsius' ? '°C' : '°F'),
    unitLabel: (state) => (state.unit === 'celsius' ? '섭씨(°C)' : '화씨(°F)'),
  },

  actions: {
    // 'celsius'와 'fahrenheit'를 토글(스위칭)하는 함수
    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius'
    },
  },
})
