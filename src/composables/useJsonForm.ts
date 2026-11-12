import { computed, ref, watch } from 'vue'
import type { FieldType, LeafField } from '../types'
import { sha256Hex } from './useSha256'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Convierte el valor original del JSON a texto editable. */
function valueToText(value: unknown): string {
  if (typeof value === 'string') return value
  return JSON.stringify(value) ?? ''
}

/** Infiere el tipo de dato a partir del valor original del JSON. */
function inferType(value: unknown, text: string): FieldType {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return 'bool'
  if (typeof value === 'number') return /^-?\d+$/.test(text) ? 'int' : 'double'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return 'date'
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) return 'datetime'
  return 'string'
}

const INT_RE = /^[-+]?\d+$/
const DOUBLE_RE = /^[-+]?(\d+(\.\d+)?|\.\d+)([eE][-+]?\d+)?$/
const DECIMAL_RE = /^[-+]?\d*\.\d+$/
const BOOL_VALUES = new Set(['true', 'false'])
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const DATETIME_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

function isValidDate(text: string): boolean {
  const match = DATE_RE.exec(text)
  if (match === null) return false
  const yearText = match[1]
  const monthText = match[2]
  const dayText = match[3]
  if (yearText === undefined || monthText === undefined || dayText === undefined) return false
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function isValidDateTime(text: string): boolean {
  return DATETIME_RE.test(text) && !Number.isNaN(Date.parse(text))
}

/** Devuelve un mensaje de error si el valor no cumple su tipo, o null si es válido. */
function validateField(field: LeafField): string | null {
  switch (field.type) {
    case 'string':
    case 'null':
      return null
    case 'int':
      return INT_RE.test(field.value) ? null : 'Debe ser un número entero.'
    case 'double':
      return DOUBLE_RE.test(field.value) && Number.isFinite(Number(field.value))
        ? null
        : 'Debe ser un número válido (admite notación exponencial).'
    case 'decimal':
      return DECIMAL_RE.test(field.value) && Number.isFinite(Number(field.value))
        ? null
        : 'Debe ser un número con decimales (ej. 12.50).'
    case 'bool':
      return BOOL_VALUES.has(field.value) ? null : "Debe ser 'true' o 'false'."
    case 'date':
      return isValidDate(field.value) ? null : 'Debe tener el formato YYYY-MM-DD.'
    case 'datetime':
      return isValidDateTime(field.value)
        ? null
        : 'Debe ser una fecha y hora ISO 8601 (ej. 2024-05-01T10:00:00Z).'
    case 'array':
      return Array.isArray(parseJson(field.value))
        ? null
        : 'Debe ser un array JSON válido (ej. [1, 2]).'
    case 'object':
      return isPlainObject(parseJson(field.value))
        ? null
        : 'Debe ser un objeto JSON válido (ej. {"a": 1}).'
  }
}

/** Representación en texto de un campo para la cadena del hash. */
function hashTextFor(field: LeafField): string {
  if (field.type === 'array' || field.type === 'object') {
    const parsed = parseJson(field.value)
    return parsed === undefined ? field.value : JSON.stringify(parsed)
  }
  return field.value
}

/** Valor de salida (JSON) de un campo según su tipo de dato. */
function fieldValueToOutput(field: LeafField): unknown {
  switch (field.type) {
    case 'null':
      return null
    case 'bool':
      return field.value === 'true'
    case 'int':
    case 'double':
    case 'decimal':
      return Number(field.value)
    case 'array':
    case 'object':
      return parseJson(field.value)
    case 'string':
    case 'date':
    case 'datetime':
      return field.value
  }
}

interface TokenOverride {
  pathKey: string
  value: string
}

/**
 * Reconstruye el JSON de salida clonando la estructura original y reemplazando
 * cada hoja por el valor editado (o por el token, en la ruta del campo token).
 */
function buildOutput(
  node: Record<string, unknown>,
  byPath: Map<string, LeafField>,
  path: string[],
  token: TokenOverride,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node)) {
    const currentPath = [...path, key]
    if (isPlainObject(value)) {
      result[key] =
        Object.keys(value).length === 0 ? {} : buildOutput(value, byPath, currentPath, token)
      continue
    }
    const pathKey = JSON.stringify(currentPath)
    if (pathKey === token.pathKey) {
      result[key] = token.value
      continue
    }
    const field = byPath.get(pathKey)
    result[key] = field === undefined ? value : fieldValueToOutput(field)
  }
  return result
}

/**
 * Estado del formulario de EasyTestingApi.
 *
 * - Parsea el JSON de entrada y lo aplana en campos hoja (las hojas mantienen
 *   el orden original del JSON: es el orden que se usará para el token).
 * - Guarda qué campo es "el campo del token" (solo uno a la vez).
 * - Valida cada campo según su tipo y genera el JSON de salida con el SHA-256.
 */
export function useJsonForm() {
  /** JSON original parseado (para reconstruir la salida con su estructura). */
  const original = ref<Record<string, unknown> | null>(null)
  /** Campos hoja en el mismo orden que aparecen en el JSON original. */
  const fields = ref<LeafField[]>([])
  /** label del campo marcado como "es el campo del token" (null = ninguno). */
  const tokenField = ref<string | null>(null)
  /** Error del último intento de parseo (vacío si no hay error). */
  const parseError = ref('')
  /** true cuando el JSON ya fue parseado y hay formulario para mostrar. */
  const isParsed = ref(false)
  /** JSON de salida formateado (null = aún no se generó). */
  const output = ref<string | null>(null)

  /** Id de la generación en curso (para descartar respuestas fuera de orden). */
  let generateId = 0

  function walk(node: Record<string, unknown>, path: string[], out: LeafField[]): void {
    for (const [key, value] of Object.entries(node)) {
      const currentPath = [...path, key]
      if (isPlainObject(value)) {
        walk(value, currentPath, out)
      } else {
        const text = valueToText(value)
        out.push({
          path: currentPath,
          label: currentPath.join('.'),
          value: text,
          type: inferType(value, text),
          participates: false,
        })
      }
    }
  }

  /** Parsea el JSON, reconstruye los campos y limpia la selección de token. */
  function applyJson(text: string): void {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch (error) {
      parseError.value = `JSON inválido: ${error instanceof Error ? error.message : String(error)}`
      return
    }

    if (!isPlainObject(parsed)) {
      parseError.value = 'El JSON debe ser un objeto.'
      return
    }

    const leaves: LeafField[] = []
    walk(parsed, [], leaves)

    if (leaves.length === 0) {
      parseError.value = 'El JSON no contiene campos editables.'
      return
    }

    original.value = parsed
    fields.value = leaves
    tokenField.value = null
    parseError.value = ''
    output.value = null
    generateId++
    isParsed.value = true
  }

  /** Marca (o desmarca con null) el campo que es "el campo del token". */
  function setTokenField(label: string | null): void {
    tokenField.value = label
    if (label === null) return
    // El token es siempre un string (SHA-256 en hexadecimal).
    const field = fields.value.find((item) => item.label === label)
    if (field !== undefined) field.type = 'string'
  }

  /** Errores de validación por campo, en vivo (clave = label del campo). */
  const fieldErrors = computed<Record<string, string>>(() => {
    const errors: Record<string, string> = {}
    for (const field of fields.value) {
      const message = validateField(field)
      if (message !== null) errors[field.label] = message
    }
    return errors
  })

  const hasFieldErrors = computed(() => Object.keys(fieldErrors.value).length > 0)

  /** Solo se puede generar si hay campo token y todos los campos son válidos. */
  const canGenerate = computed(() => tokenField.value !== null && !hasFieldErrors.value)

  /** Motivo por el que el botón de generar está deshabilitado ('' = listo). */
  const generateHint = computed(() => {
    if (tokenField.value === null) {
      return 'Marca un campo como «campo del token» para generar la salida.'
    }
    if (hasFieldErrors.value) {
      const count = Object.keys(fieldErrors.value).length
      return count === 1
        ? 'Corrige el error del campo antes de generar.'
        : `Corrige los errores de ${count} campos antes de generar.`
    }
    return ''
  })

  /** Concatena los campos participantes y calcula el SHA-256 del token. */
  async function computeToken(tokenLabel: string): Promise<string> {
    let chain = ''
    for (const field of fields.value) {
      if (!field.participates || field.label === tokenLabel || field.type === 'null') continue
      const text = hashTextFor(field)
      // Regla de vacíos: un campo vacío (o solo espacios) se omite del hash.
      if (text.trim() === '') continue
      chain += text
    }
    return sha256Hex(chain)
  }

  /** Genera el JSON de salida con el token calculado. */
  async function generate(): Promise<void> {
    if (!canGenerate.value || original.value === null) return
    const tokenLabel = tokenField.value
    if (tokenLabel === null) return
    const tokenFieldState = fields.value.find((item) => item.label === tokenLabel)
    if (tokenFieldState === undefined) return

    const id = ++generateId
    try {
      const token = await computeToken(tokenLabel)
      if (id !== generateId) return

      const byPath = new Map<string, LeafField>(
        fields.value.map((field): [string, LeafField] => [JSON.stringify(field.path), field]),
      )
      const result = buildOutput(original.value, byPath, [], {
        pathKey: JSON.stringify(tokenFieldState.path),
        value: token,
      })

      output.value = JSON.stringify(result, null, 2)
      if (tokenFieldState.value !== token) tokenFieldState.value = token
    } catch {
      // Si el cálculo falla, se mantiene la salida anterior.
    }
  }

  // La salida ya generada se actualiza sola al editar cualquier campo.
  watch(
    [fields, tokenField],
    () => {
      if (output.value !== null) void generate()
    },
    { deep: true },
  )

  return {
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
  }
}
