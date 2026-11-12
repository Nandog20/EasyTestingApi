/** Tipos de dato soportados en el select de cada campo. */
export type FieldType =
  | 'string'
  | 'int'
  | 'double'
  | 'decimal'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'array'
  | 'object'
  | 'null'

/** Campo hoja del JSON: un valor editable identificado por su ruta de keys. */
export interface LeafField {
  /** Ruta completa desde la raíz, p. ej. ['direccion', 'calle']. */
  path: string[]
  /** Identificador visible del campo, p. ej. 'direccion.calle'. */
  label: string
  /** Valor actual del campo en texto (lo que el usuario escribe). */
  value: string
  /** Tipo de dato elegido para el campo (define validación y salida). */
  type: FieldType
  /** true si el campo participa en el cálculo del token. */
  participates: boolean
}
