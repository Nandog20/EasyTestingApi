<script setup lang="ts">
import type { FieldType, LeafField } from '../types'
import FieldRow from './FieldRow.vue'

withDefaults(
  defineProps<{
    fields: LeafField[]
    tokenField: string | null
    errors?: Record<string, string>
  }>(),
  { errors: () => ({}) },
)

const emit = defineEmits<{
  'update:tokenField': [label: string | null]
}>()

function setValue(field: LeafField, value: string) {
  field.value = value
}

function setType(field: LeafField, type: FieldType) {
  field.type = type
}

function setParticipates(field: LeafField, participates: boolean) {
  field.participates = participates
}

function setToken(label: string | null) {
  emit('update:tokenField', label)
}
</script>

<template>
  <div class="fields">
    <FieldRow
      v-for="field in fields"
      :key="field.label"
      :field="field"
      :is-token-field="tokenField === field.label"
      :error="errors[field.label]"
      @updateValue="setValue(field, $event)"
      @updateType="setType(field, $event)"
      @updateParticipates="setParticipates(field, $event)"
      @setToken="setToken($event)"
    />

    <p class="fields__note">
      El orden de los campos es el del JSON original: es el orden que se usará para calcular el
      token.
    </p>
  </div>
</template>

<style scoped>
.fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-x: auto;
}

.fields__note {
  margin: 0.5rem 0 0;
  color: var(--color-muted, #5b6675);
  font-size: 0.85rem;
}
</style>
