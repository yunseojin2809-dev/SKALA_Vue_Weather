<script setup>
defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const onInput = (e) => {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <div class="search-box">
    <input
      type="text"
      :value="modelValue"
      @input="onInput"
      placeholder="지역 이름으로 검색 (예: 대전)"
    />
    <div class="search-echo">
      검색 중인 지역: <b>{{ modelValue || '전체' }}</b>
    </div>
  </div>
</template>

<style scoped>
.search-box {
  margin: 0 0 20px;
}
.search-box input {
  width: 100%;
  padding: 13px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  background: var(--card-bg);
  color: var(--text);
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}
.search-box input::placeholder {
  color: var(--text-tertiary);
}
.search-box input:focus {
  border-color: var(--accent-orange);
}
.search-echo {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 8px 4px 0;
}
.search-echo b {
  color: var(--text);
  font-weight: 600;
}
</style>
