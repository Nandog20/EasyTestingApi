<script setup lang="ts">
import type { FieldType } from '../types'

defineProps<{
  modelValue: FieldType
  fieldLabel: string
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [type: FieldType] }>()

const TYPES: FieldType[] = [
  'string',
  'int',
  'double',
  'decimal',
  'bool',
  'date',
  'datetime',
  'array',
  'object',
  'null',
]

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value as FieldType)
}
</script>

<template>
  <select
    class="type-select"
    :value="modelValue"
    :disabled="disabled"
    :aria-label="`Tipo de dato de ${fieldLabel}`"
    :title="
      disabled ? 'El campo del token es siempre un string (SHA-256 en hexadecimal).' : undefined
    "
    @change="onChange"
  >
    <option v-for="type in TYPES" :key="type" :value="type">{{ type }}</option>
  </select>
</template>

<style scoped>
.type-select {
  box-sizing: border-box;
  width: 100%;
  padding: 0.4rem 0.35rem;
  border: 1px solid var(--color-border, #d9dee5);
  border-radius: 6px;
  background: #fff;
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.type-select:focus {
  border-color: var(--color-accent, #2563eb);
  outline: none;
  box-shadow: 0 0 0 2px rgb(37 99 235 / 20%);
}

.type-select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
