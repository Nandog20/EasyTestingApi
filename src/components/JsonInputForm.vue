<script setup lang="ts">
import { ref } from 'vue'

/** Texto crudo que escribe el usuario en el textarea. */
const text = ref('')

defineProps<{ error?: string }>()

const emit = defineEmits<{ submit: [text: string] }>()

function onSubmit() {
  emit('submit', text.value)
}
</script>

<template>
  <form class="json-input" novalidate @submit.prevent="onSubmit">
    <label class="json-input__label" for="json-source">JSON de entrada</label>
    <textarea
      id="json-source"
      v-model="text"
      class="json-input__textarea"
      rows="12"
      spellcheck="false"
      placeholder='{"nombre": "Juan", "edad": 25, "direccion": {"calle": "Av. Siempreviva", "numero": 742}, "token": ""}'
    ></textarea>

    <p v-if="error" class="json-input__error" role="alert">{{ error }}</p>

    <button class="json-input__submit" type="submit">Generar formulario</button>
  </form>
</template>

<style scoped>
.json-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.json-input__label {
  font-size: 0.95rem;
  font-weight: 600;
}

.json-input__textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border, #d9dee5);
  border-radius: 8px;
  background: #fff;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
}

.json-input__textarea:focus {
  border-color: var(--color-accent, #2563eb);
  outline: 2px solid var(--color-accent, #2563eb);
  outline-offset: 1px;
}

.json-input__error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.9rem;
}

.json-input__submit {
  align-self: flex-start;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 8px;
  background: var(--color-accent, #2563eb);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.json-input__submit:hover {
  background: #1d4ed8;
}
</style>
