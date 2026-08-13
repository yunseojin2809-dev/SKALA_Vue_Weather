<script setup>
import { useConfigStore } from '../stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <span class="unit-label">{{ configStore.unitLabel }}</span>
    <button class="unit-btn" @click="configStore.toggleUnit()">단위변경</button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 6px;
}
.unit-label {
  font-size: 13px;
  color: #ffffff; /* 기존 회색(#94a3b8 등)을 #ffffff (흰색)으로 변경! */
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5); /* 잘 보이도록 그림자 살짝 추가 */
}
.unit-btn {
  border: none;
  background: var(--accent-blue);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 100px;
  cursor: pointer;
  white-space: nowrap;
}
.unit-btn:hover {
  opacity: 0.9;
}
</style>
