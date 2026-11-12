<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  output: string | null
  disabled: boolean
  hint: string
}>()

const emit = defineEmits<{ generate: [] }>()

const copied = ref(false)

async function copy() {
  if (props.output === null) return
  try {
    await navigator.clipboard.writeText(props.output)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    // Portapapeles no disponible; se ignora silenciosamente.
  }
}
</script>

<template>
  <section class="output">
    <div class="output__actions">
      <button
        class="output__generate"
        type="button"
        :disabled="disabled"
        @click="emit('generate')"
      >
        Generar JSON con token
      </button>
      <button v-if="output !== null" class="output__copy" type="button" @click="copy">
        {{ copied ? '¡Copiado!' : 'Copiar JSON' }}
      </button>
    </div>

    <p v-if="disabled && hint" class="output__hint" role="status">{{ hint }}</p>

    <div v-if="output !== null" class="output__panel">
      <h3 class="output__title">JSON de salida</h3>
      <pre class="output__pre"><code>{{ output }}</code></pre>
    </div>
  </section>
</template>

<style scoped>
.output {
  margin-top: 1.75rem;
}

.output__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.output__generate {
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 8px;
  background: var(--color-accent, #2563eb);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.output__generate:hover:not(:disabled) {
  background: #1d4ed8;
}

.output__generate:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.output__copy {
  padding: 0.55rem 1.1rem;
  border: 1px solid var(--color-border, #d9dee5);
  border-radius: 8px;
  background: #fff;
  color: #1f2933;
  font-size: 0.9rem;
  cursor: pointer;
}

.output__copy:hover {
  border-color: var(--color-accent, #2563eb);
  color: var(--color-accent, #2563eb);
}

.output__hint {
  margin: 0.75rem 0 0;
  color: #92400e;
  font-size: 0.88rem;
}

.output__title {
  margin: 1rem 0 0.5rem;
  font-size: 1rem;
}

.output__pre {
  overflow-x: auto;
  margin: 0;
  padding: 1rem;
  border-radius: 8px;
  background: #111827;
  color: #e5e7eb;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
  font-size: 0.87rem;
  line-height: 1.55;
}
</style>
