<script setup>
defineProps({
  count: { type: Number, default: 0 },
})
</script>

<template>
  <div v-if="count > 0" class="alert-banner">
    🚨 현재 <b>{{ count }}</b>곳에서 심각 등급 위험 경보가 발효 중입니다.
  </div>
</template>

<style scoped>
.alert-banner {
  margin: 0 0 16px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: rgba(255, 59, 48, 0.08);
  border: 1px solid rgba(255, 59, 48, 0.22);
  color: #d70015;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 32px !important;
}
</style>
