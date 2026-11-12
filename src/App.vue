<script setup lang="ts">
import EditableFieldsForm from './components/EditableFieldsForm.vue'
import JsonInputForm from './components/JsonInputForm.vue'
import JsonOutput from './components/JsonOutput.vue'
import { useJsonForm } from './composables/useJsonForm'

const {
  fields,
  tokenField,
  parseError,
  isParsed,
  output,
  fieldErrors,
  canGenerate,
  generateHint,
  applyJson,
  setTokenField,
  generate,
} = useJsonForm()
</script>

<template>
  <main class="app">
    <header class="app__header">
      <h1>EasyTestingApi</h1>
      <p class="app__subtitle">
        Pega un JSON, conviértelo en formulario editable y elige qué campos intervienen en el token.
      </p>
    </header>

    <JsonInputForm :error="parseError" @submit="applyJson" />

    <section v-if="isParsed" class="app__section">
      <h2>Campos del JSON</h2>

      <p v-if="tokenField === null" class="app__hint" role="status">
        Ningún campo está marcado todavía como <strong>campo del token</strong>. Marca uno para
        poder generar el token.
      </p>

      <EditableFieldsForm
        :fields="fields"
        :token-field="tokenField"
        :errors="fieldErrors"
        @update:tokenField="setTokenField"
      />

      <JsonOutput :output="output" :disabled="!canGenerate" :hint="generateHint" @generate="generate" />
    </section>
  </main>
</template>

<style scoped>
:global(body) {
  margin: 0;
  background: #f5f7fa;
}

.app {
  --color-border: #d9dee5;
  --color-muted: #5b6675;
  --color-accent: #2563eb;
  --row-grid: minmax(140px, 1fr) minmax(200px, 1.6fr) 115px auto auto;
  box-sizing: border-box;
  max-width: 980px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  color: #1f2933;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.app__header {
  margin-bottom: 1.5rem;
}

.app__header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
}

.app__subtitle {
  margin: 0;
  color: var(--color-muted);
}

.app__section {
  margin-top: 2rem;
}

.app__section h2 {
  margin: 0 0 0.75rem;
  font-size: 1.15rem;
}

.app__hint {
  margin: 0 0 0.75rem;
  padding: 0.6rem 0.85rem;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  background: #fffbeb;
  color: #92400e;
  font-size: 0.9rem;
}
</style>
