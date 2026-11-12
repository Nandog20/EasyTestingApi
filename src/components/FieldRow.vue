<script setup lang="ts">
import type { FieldType, LeafField } from '../types'
import TypeSelect from './TypeSelect.vue'

const props = defineProps<{
  field: LeafField
  isTokenField: boolean
  error?: string
}>()

const emit = defineEmits<{
  updateValue: [value: string]
  updateType: [type: FieldType]
  updateParticipates: [participates: boolean]
  setToken: [label: string | null]
}>()

const inputId = `field-${props.field.label.replace(/\s+/g, '-')}`

function onInput(event: Event) {
  emit('updateValue', (event.target as HTMLInputElement).value)
}

function onTypeChange(type: FieldType) {
  emit('updateType', type)
}

function onTokenChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  emit('setToken', checked ? props.field.label : null)
}

function onParticipatesChange(event: Event) {
  emit('updateParticipates', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <div
    class="row"
    :class="{ 'row--token': isTokenField, 'row--invalid': error !== undefined }"
  >
    <label class="row__key" :for="inputId">{{ field.label }}</label>

    <input
      :id="inputId"
      class="row__value"
      type="text"
      :value="field.value"
      :disabled="field.type === 'null'"
      :title="
        field.type === 'null'
          ? 'Este campo es siempre null: cambia su tipo si quieres editarlo.'
          : undefined
      "
      @input="onInput"
    />

    <TypeSelect
      :model-value="field.type"
      :field-label="field.label"
      :disabled="isTokenField"
      @update:modelValue="onTypeChange"
    />

    <label class="row__check">
      <input type="checkbox" :checked="isTokenField" @change="onTokenChange" />
      <span>Es el campo del token</span>
    </label>

    <label
      class="row__check"
      :class="{ 'row__check--disabled': isTokenField }"
      :title="isTokenField ? 'El campo del token no participa en el cálculo.' : undefined"
    >
      <input
        type="checkbox"
        :checked="field.participates"
        :disabled="isTokenField"
        @change="onParticipatesChange"
      />
      <span>Participa en el token</span>
    </label>

    <p v-if="error" class="row__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns:
    var(--row-grid, minmax(140px, 1fr) minmax(200px, 1.6fr) 115px auto auto);
  gap: 0.75rem;
  align-items: center;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border, #d9dee5);
  border-radius: 8px;
  background: #fff;
}

.row--token {
  border-color: #93c5fd;
  background: #eff6ff;
}

.row--invalid {
  border-color: #fca5a5;
  background: #fef2f2;
}

.row__key {
  overflow-wrap: anywhere;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
  font-size: 0.9rem;
  font-weight: 600;
}

.row__value {
  box-sizing: border-box;
  width: 100%;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--color-border, #d9dee5);
  border-radius: 6px;
  background: #fff;
  font-size: 0.9rem;
}

.row--invalid .row__value {
  border-color: #dc2626;
}

.row__value:focus {
  border-color: var(--color-accent, #2563eb);
  outline: none;
  box-shadow: 0 0 0 2px rgb(37 99 235 / 20%);
}

.row__value:disabled {
  background: #f1f5f9;
  color: var(--color-muted, #5b6675);
  cursor: not-allowed;
}

.row__check {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  white-space: nowrap;
  font-size: 0.85rem;
  cursor: pointer;
  user-select: none;
}

.row__check input {
  width: 1rem;
  height: 1rem;
  margin: 0;
  accent-color: var(--color-accent, #2563eb);
  cursor: pointer;
}

.row__check--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.row__check--disabled input {
  cursor: not-allowed;
}

.row__error {
  grid-column: 1 / -1;
  margin: 0;
  color: #b91c1c;
  font-size: 0.82rem;
}
</style>
