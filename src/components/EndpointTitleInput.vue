<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * Input (no es un form) cuyo único propósito es cambiar el título de la
 * pestaña del navegador para identificar qué endpoint se está utilizando.
 */
const value = ref('')

/** Título por defecto de la aplicación, usado cuando el input está vacío. */
const DEFAULT_TITLE = 'EasyTestingApi'

watch(value, (next) => {
  const trimmed = next.trim()
  document.title = trimmed === '' ? DEFAULT_TITLE : `${trimmed} · ${DEFAULT_TITLE}`
})
</script>

<template>
  <div class="endpoint-title">
    <label class="endpoint-title__label" for="endpoint-name">Endpoint en uso</label>
    <input
      id="endpoint-name"
      v-model="value"
      class="endpoint-title__input"
      type="text"
      autocomplete="off"
      spellcheck="false"
      placeholder="GET /api/usuarios"
    />
  </div>
</template>

<style scoped>
.endpoint-title {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.endpoint-title__label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-muted, #5b6675);
}

.endpoint-title__input {
  box-sizing: border-box;
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-border, #d9dee5);
  border-radius: 8px;
  background: #fff;
  font-family: inherit;
  font-size: 0.95rem;
}

.endpoint-title__input:focus {
  border-color: var(--color-accent, #2563eb);
  outline: 2px solid var(--color-accent, #2563eb);
  outline-offset: 1px;
}
</style>
