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
  flex-shrink: 0;
}
.unit-label {
  font-size: 13px;
  color: #ffffff;
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}
.unit-btn {
  border: none;
  background: var(--accent-blue, #0284c7);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 100px;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}
.unit-btn:hover {
  opacity: 0.9;
}
</style>