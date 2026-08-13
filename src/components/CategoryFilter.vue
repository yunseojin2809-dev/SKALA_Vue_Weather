<script setup>
defineProps({
  modelValue: { type: String, default: 'all' },
  categoryLabel: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="chip-row">
    <button
      v-for="cat in ['all', 'mountain', 'coastal', 'default']"
      :key="cat"
      class="chip"
      :class="{ active: modelValue === cat }"
      @click="emit('update:modelValue', cat)"
    >
      {{ categoryLabel[cat] }}
    </button>
  </div>
</template>

<style scoped>
.chip-row {
  display: flex;
  gap: 8px;
  margin: 0 0 18px;
  flex-wrap: wrap;
}
.chip {
  border: 1px solid var(--line);
  background: var(--card-bg);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 100px;
  cursor: pointer;
}
.chip.active {
  background: var(--accent-orange);
  border-color: var(--accent-orange);
  color: #fff;
}
</style>
