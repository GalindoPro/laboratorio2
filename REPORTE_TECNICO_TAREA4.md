# REPORTE TÉCNICO: ARQUITECTURA DEL REPOSITORIO GENÉRICO DE DATOS Y MATRIZ DE TIPADO EN TYPESCRIPT

**Asignatura:** Desarrollo Web | **Ciclo:** 8vo Semestre UMG  
**Proyecto:** Plataforma Multimedia CineVerse  
**Entregable:** Tarea 4  

---

## 1. CUADRO COMPARATIVO ANALÍTICO: `interface` VS `type`

En el desarrollo de la solución arquitectónica para CineVerse, la elección entre `interface` y `type` se realizó bajo criterios formales de ingeniería de software y programación orientada a objetos:

| Criterio de Selección | `interface` | `type` (Alias / Utility Types) |
| :--- | :--- | :--- |
| **Casos de Uso en CineVerse** | Definición del contrato base `MediaItem`, y de las entidades del dominio: `Movie`, `Series`, `Documentary`, `Review`, `Ad`. | Tipos de uniones `MediaType = 'movie' \| 'series' \| 'documentary'`, y proyecciones de Utility Types: `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`. |
| **Herencia y Extensibilidad** | **Alta**: Permite extensión natural mediante la palabra clave `extends` (`interface Movie extends MediaItem`), facilitando el polimorfismo. | **Composición**: Requiere uniones o intersecciones (`&`). No soporta *Declaration Merging* explícito. |
| **Saneamiento y Utility Types** | No aplicable directamente a transformaciones dinámicas. | **Excelente**: Permite manipular esquemas de datos sobre la marcha (`Partial<SeriesDTO>`, `Pick<MediaItem, 'id' \| 'title'>`). |
| **Justificación Arquitectónica** | Se eligió `interface` para todas las **entidades de dominio principales** porque representan modelos de objetos con contratos claros y heredables. | Se eligió `type` para la **matriz de tipos de utilidad y uniones discretas**, ya que `type` es la herramienta idónea para transformaciones puras en tiempo de compilación. |

---

## 2. DIAGRAMA CONCEPTUAL DE FLUJO DE DATOS

El siguiente diagrama detalla el ciclo de vida del dato desde su origen como payload crudo hasta su renderizado seguro en el DOM:

```mermaid
flowchart TD
    A[📡 API REST / Backend Payload] -->|JSON Crudo / Incompleto| B[📦 DTO Layer: MovieDTO / SeriesDTO / DocumentaryDTO]
    B -->|Payload Parcial / Corrupto: Partial<T>| C[⚙️ Mapper Layer: mapDTOToEntity]
    C -->|Sanitización / Fallbacks de Negocio| D[🛡️ Clean Domain Entity: MediaItem / Movie / Series / Documentary]
    D -->|Inyección Polimórfica| E[🗃️ Generic Repository: DataCatalogManager<T extends { id: string | number }>]
    E -->|Filtrado / Búsquedas Tipadas| F[💾 MediaStore Centralizado]
    F -->|DocumentFragment & Template HTML5| G[🖥️ Interfaz de Usuario / DOM]
```

### Explicación del Flujo de Datos:
1. **Entrada de Datos Crudos (DTO)**: Las respuestas de la red ingresan como objetos `MovieDTO`, `SeriesDTO` o `DocumentaryDTO`. Los campos pueden ser nulos o ausentes.
2. **Transformación y Saneamiento (Mapper Layer)**: Los mappers reciben tipos de utilidad `Partial<DTO>`. Si falta algún campo (ej. `rating` o `poster`), el mapper aplica valores de fallback por defecto.
3. **Repositorio Genérico (`DataCatalogManager<T>`)**: Las entidades limpias que extienden `MediaItem` se inyectan en el catálogo genérico reutilizable.
4. **Renderizado en UI**: Los componentes reciben entidades garantizadas sin riesgo de errores de tipo `undefined` o `null` en el navegador.

---

## 3. EVIDENCIA DE COMPILACIÓN ESTRICTA EN TYPESCRIPT (`npx tsc`)

La base de código está configurada bajo las reglas más estrictas del compilador de TypeScript (`tsconfig.json` con `"strict": true`, `"noImplicitAny": true`, `"noEmitOnError": true`).

### Resultado de la Ejecución en Terminal:

```bash
$ npx tsc
(Ejecución completada con código de salida 0: 0 errores, 0 advertencias)
```

La compilación estricta verifica que:
- No existen tipos explícitos u implícitos de tipo `any`.
- Todos los métodos del repositorio genérico `DataCatalogManager<T>` respetan estrictamente los genéricos.
- Los Utility Types (`Partial<T>`, `Pick<T, K>`, `Omit<T, K>`) garantizan total seguridad de tipos.
