import { defineStore } from 'pinia'

// 본인만의 추가 Store: 최근 검색어를 기록해 검색창 아래 칩(chip)으로 노출
export const useSearchHistoryStore = defineStore('searchHistory', {
  state: () => ({
    history: [],
  }),

  getters: {
    recentHistory: (state) => state.history.slice(0, 5),
  },

  actions: {
    addSearch(term) {
      const trimmed = term.trim()
      if (!trimmed) return
      this.history = [trimmed, ...this.history.filter((h) => h !== trimmed)]
    },
    clearHistory() {
      this.history = []
    },
  },
})
