<script setup>
defineProps({
  text: { type: String, required: true },
})
</script>

<template>
  <div class="status-bar">
    <div class="status-bar-inner">{{ text }}</div>
  </div>
</template>

<style scoped>
.status-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: center;
  padding: 16px 0 0;
}
.status-bar-inner {
  width: 100%;
  padding: 13px 18px;
  border-radius: var(--radius-md);
  background: var(--card-bg);
  box-shadow: var(--shadow-card);
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  box-sizing: border-box;
}
</style>
