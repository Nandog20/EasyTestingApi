# AGENTS.md — EasyTestingApi

## Visión general

EasyTestingApi es una herramienta **100% frontend** (Vue 3) que transforma un JSON en texto en un formulario editable y devuelve el JSON con un campo **token SHA-256** actualizado, conservando exactamente la misma estructura de entrada (mismas keys, mismo orden, mismo anidamiento).

No hay backend: el hash se calcula en el navegador con la **Web Crypto API** (`window.crypto.subtle`), sin librerías externas.

## Stack y comandos

- Vue 3.5 + Vite + TypeScript (Composition API con `<script setup lang="ts">`)
- Gestor de paquetes: **pnpm**

```sh
pnpm install      # instalar dependencias
pnpm dev          # servidor de desarrollo (hot-reload)
pnpm build        # type-check + build de producción
pnpm type-check   # solo type-check (vue-tsc)
pnpm preview      # previsualizar el build de producción
```

## Flujo funcional

1. **Input**: textarea donde se pega un JSON en texto. Puede contener objetos anidados (ej. `direccion: {calle, numero}`). Siempre se asume que existe un campo destinado al token.
2. Al enviar el formulario se parsea el JSON y se renderiza **campo hoja por campo hoja**:
   - su **key** (ej. `direccion.calle`),
   - un **input** para editar el valor,
   - un **select de tipo de dato**,
   - **dos checkboxes** (ver abajo).
3. **Checkboxes por campo**:
   - ☐ **Es el campo del token** — comportamiento de radio: solo un campo a la vez puede tenerlo marcado. Este campo **no participa** en el cálculo del hash; solo **recibe** el resultado.
   - ☐ **Participa en el token** — múltiples campos pueden marcarse. El **orden de arriba a abajo** en el formulario es el orden de hasheo.
4. El token se **recalcula automáticamente** con cada edición de cualquier campo del formulario (watch reactiva).
5. **Output**: el JSON resultante con todos los cambios aplicados y el campo token actualizado, respetando la misma estructura de entrada.

### Ejemplo

Entrada:

```json
{
  "nombre": "Juan",
  "edad": 25,
  "direccion": { "calle": "Av. Siempreviva", "numero": 742 },
  "token": ""
}
```

El formulario mostrará 4 campos hoja (`nombre`, `edad`, `direccion.calle`, `direccion.numero`) + el campo `token`. Si se marcan `nombre`, `edad` y `direccion.calle` como participantes (en ese orden) y `token` como campo del token, se hasheará la concatenación de `"Juan"`, `"25"` y `"Av. Siempreviva"`.

## Especificación del algoritmo (SHA-256)

1. Recoger los **valores** de los campos marcados "participa en el token", **en orden de aparición en el formulario** (arriba → abajo, que coincide con el orden del JSON original).
2. Concatenar los valores **directamente, sin separador** (ej. `"Juan" + "25"` → `"Juan25"`).
   - Cada valor se convierte a su representación en texto según su tipo seleccionado (ver reglas de tipo abajo).
3. Calcular **SHA-256** sobre esa cadena (UTF-8).
4. Salida: **hexadecimal en minúsculas**, 64 caracteres (sin prefijo `0x`).
5. Escribir el resultado en el campo token.
6. El campo token **nunca** entra en la cadena a hashear.

```ts
// referencia de implementación
const data = new TextEncoder().encode(concatenatedValues);
const digest = await crypto.subtle.digest("SHA-256", data);
const token = [...new Uint8Array(digest)]
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("");
```

## Tipos de dato y validación (bloqueante)

Cada campo hoja tiene un `select` con estos tipos:

| Tipo     | Validación del input             | Serialización de vuelta al JSON   |
| -------- | -------------------------------- | --------------------------------- |
| `string` | cualquiera                       | string                            |
| `int`    | entero                           | número entero                     |
| `double` | número (hasta ~15-16 dígitos)    | número                            |
| `decimal`| número con decimales             | número                            |
| `bool`   | `true` / `false`                 | booleano                          |
| `date`   | fecha `YYYY-MM-DD`               | string ISO de fecha               |
| `datetime` | fecha y hora ISO 8601          | string ISO de fecha-hora           |
| `array`  | JSON array válido                | array                             |
| `object` | JSON object válido               | objeto                            |

Al editar el valor de un campo, la representación usada para el hash es:
- `string`, `date`, `datetime`: el texto tal cual.
- `int`, `double`, `decimal`: su representación numérica (sin comillas).
- `bool`: `true` / `false`.
- `array`, `object`: su serialización JSON.

**El envío se bloquea** (mensaje de error visible, no se genera el JSON de salida) cuando ocurre cualquiera de estas condiciones:

1. El JSON de entrada no es válido (error de parseo).
2. Ningún campo tiene marcado "es el campo del token".
3. Algún valor editado no coincide con su tipo de dato seleccionado.
4. (Implícito) Hay campos marcados "participa" pero el cálculo del hash falla.

## Estructura de archivos propuesta

```
src/
├── App.vue                       # layout principal
├── components/
│   ├── JsonInputForm.vue         # textarea de entrada + botón enviar
│   ├── EditableFieldsForm.vue    # grilla de campos editados + output
│   ├── FieldRow.vue              # key + input + select de tipo + checkboxes
│   └── TypeSelect.vue            # select de tipos de dato
├── composables/
│   ├── useJsonForm.ts            # parseo, estado de campos, validación
│   └── useSha256.ts              # cálculo del token con Web Crypto
└── types/
    └── index.ts                  # FieldType, FieldState, FormState
```

## Convenciones

- Composition API con `<script setup lang="ts">`; TypeScript estricto.
- Nombres en inglés para código, componentes y variables; documentación en español.
- Mantener la estructura del JSON de salida idéntica a la de entrada: mismo orden de keys, mismo anidamiento, solo cambia el valor del campo token (y los valores editados por el usuario).
- Un solo campo con "es el campo del token" a la vez: marcar uno desmarca el anterior.
- El recálculo del token debe ser reactivo (se ejecuta en cada cambio de cualquier campo).
- No añadir dependencias para el hash: usar `crypto.subtle` del navegador.
