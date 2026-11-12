# EasyTestingApi

Herramienta **100% frontend** para testear APIs: pegas un JSON en texto, se convierte en un
formulario editable con selectores de tipo de dato, eliges qué campos participan en un token
**SHA-256** y generas el JSON de salida con el token actualizado, **conservando la misma
estructura** del JSON original.

No hay backend: el hash se calcula en el navegador con la
[Web Crypto API](https://developer.mozilla.org/es/docs/Web/API/SubtleCrypto) (`crypto.subtle`),
sin dependencias adicionales.

## Características

- **Entrada**: textarea con un JSON en texto (soporta objetos anidados, arrays y `null`).
- **Formulario editable**: cada campo hoja aparece con su key (`direccion.calle`), un input para
  editar el valor y su **select de tipo de dato** (`string`, `int`, `double`, `decimal`, `bool`,
  `date`, `datetime`, `array`, `object`, `null`), con inferencia automática desde el JSON original.
- **Token**: por cada campo, dos checkboxes:
  - ☐ **Es el campo del token** — solo uno a la vez; siempre de tipo `string` y solo *recibe* el hash.
  - ☐ **Participa en el token** — el orden de arriba a abajo es el orden de hasheo.
- **Validación en vivo**: valores que no cumplen su tipo muestran el error en el campo y bloquean
  la generación (ej. `int` con texto, fechas inexistentes, JSON mal formado en `array`/`object`).
- **Salida**: botón «Generar JSON con token» + botón copiar; una vez generada, la salida se
  actualiza sola al editar cualquier campo.
- **Campos vacíos** (casos de prueba): se conservan en la salida; si un campo participante está
  vacío, simplemente **se omite de la cadena del hash**.

## Cómo funciona

1. Pega el JSON en el formulario de entrada y pulsa **Generar formulario**.
2. Edita los valores, elige el tipo de dato de cada campo y marca el campo del token y los
   campos que participan en él.
3. Pulsa **Generar JSON con token**: obtienes el JSON con todos tus cambios y el token SHA-256
   calculado en su campo.

Ejemplo de entrada:

```json
{
  "nombre": "Juan",
  "edad": 25,
  "direccion": { "calle": "Av. Siempreviva", "numero": 742 },
  "token": ""
}
```

Con `nombre`, `edad` y `direccion.calle` marcados como participantes (en ese orden) y `token`
como campo del token, el token será
`SHA-256("Juan" + "25" + "Av. Siempreviva")` = `SHA-256("Juan25Av. Siempreviva")`.

## Especificación del hash

- Concatenación **directa, sin separador**, de los valores de los campos participantes en orden
  del JSON original.
- Los campos con valor vacío (o solo espacios) **se omiten** de la cadena.
- El campo del token **nunca** participa en el cálculo.
- Salida en **hexadecimal en minúsculas**, 64 caracteres.

La especificación completa (tipos, validaciones y reglas) está en [`AGENTS.md`](./AGENTS.md).

## Stack y requisitos

- [Vue 3](https://vuejs.org/) 3.5 + [Vite](https://vite.dev/) + TypeScript (Composition API)
- Gestor de paquetes: **pnpm**
- Node.js `^22.18.0 || >=24.12.0`

## Instalación y uso

```sh
pnpm install      # instalar dependencias
pnpm dev          # servidor de desarrollo → http://localhost:5173
```

### Otros comandos

```sh
pnpm build        # type-check + build de producción
pnpm type-check   # solo type-check (vue-tsc)
pnpm preview      # previsualizar el build de producción
```

## Estructura del proyecto

```
src/
├── App.vue                       # layout principal
├── components/
│   ├── JsonInputForm.vue         # textarea de entrada + botón enviar
│   ├── EditableFieldsForm.vue    # grilla de campos editados
│   ├── FieldRow.vue              # key + input + select de tipo + checkboxes
│   ├── TypeSelect.vue            # select de tipos de dato
│   └── JsonOutput.vue            # botón "generar" + JSON de salida con token
├── composables/
│   ├── useJsonForm.ts            # parseo, estado de campos, validación, salida
│   └── useSha256.ts              # cálculo del token con Web Crypto
└── types/
    └── index.ts                  # FieldType, LeafField
```

## Licencia

Este proyecto está bajo la **Licencia MIT**.

Se permite su uso, copia, modificación, fusión, publicación, distribución y venta sin
restricciones, siempre que se conserve el aviso de copyright y esta licencia.

```
Copyright (c) 2026 EasyTestingApi
```

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
