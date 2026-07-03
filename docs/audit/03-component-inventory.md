# Aurelis — component inventory

## Componentes compartidos existentes

| Componente | Ubicación | Propósito y reutilización | Mejora sugerida |
|---|---|---|---|
| `SongRow` | `src/components/song-row.tsx` | Fila navegable de canción; usada en Inicio, Biblioteca, Organización y Setlist | Desacoplar navegación, añadir variantes/acciones y metadata accesible |
| `Button` | `src/components/ui/button.tsx` | CTA primary/secondary, compact y disabled; reutilización alta | Loading, iconos, tamaños, focus/pressed y accessibility props |
| `Screen` | `src/components/ui/screen.tsx` | Safe area, header, título/subtítulo y contenido scroll/no-scroll; tabs principales | Soportar refresh, footer, estados y presets de ancho/espaciado |
| `SectionTitle` | `src/components/ui/section-title.tsx` | Encabezado de sección con acción opcional; hoy usado en Inicio | Tipar acción como componente/Link y unificar jerarquía tipográfica |
| `ToastHost` | `src/components/ui/toast-host.tsx` | Feedback global success/error/warning/info con autocierre | Cola, duración por mensaje, live region, acción/reintento y safe-area |
| `DateField` | `src/components/ui/date-field.ts` | Fachada por plataforma para fecha ISO; usada en crear setlist | Evitar selección por `process.env.EXPO_OS`, añadir error/label/min/max |
| `DateField` nativo | `src/components/ui/date-field.native.tsx` | DateTimePicker y etiqueta amigable | Confirmación Android, estado disabled y pruebas por plataforma |
| `DateField` web | `src/components/ui/date-field.web.tsx` | `<input type=date>` estilizado | Focus visible, label asociada y paridad visual con nativo |

## Componentes estructurales

| Componente | Ubicación | Propósito | Mejora sugerida |
|---|---|---|---|
| `RootLayout` / `AppGate` | `src/app/_layout.tsx` | Providers, sesión, scope local, sync y stack | Separar gate/sync en hooks testeables y definir pantalla de arranque |
| `TabLayout` | `src/app/(tabs)/_layout.tsx` | Navegación principal de cuatro tabs | Usar iconografía semántica consistente y labels accesibles |
| `Brand` | `src/app/auth.tsx` | Marca de acceso; local a la pantalla | Candidato a compartido para onboarding, marketing y estados de cuenta |
| `Field` | `src/app/editor.tsx` | Wrapper local de campo del editor | Convertir en primitive form sólo cuando se unifique estrategia de formularios |

## Patrones repetidos aún no encapsulados

No son componentes actuales, pero aparecen de forma repetida y deben entrar al radar de Product Design:

- `TopBar/ModalHeader`: cancelar, título, acción guardar.
- `EmptyState`: título, explicación y acción.
- `LoadingState` y `ErrorState`.
- `TextField/TextArea`, label, helper y mensaje de validación.
- `Chip/FilterChip/RoleChip` y selector segmentado.
- `Card/ListCard`, avatar/initial mark y metadata row.
- `OrganizationSection`, `MemberCard`, `InstrumentPicker`.
- `SetlistItemRow`, reorder controls y linked/unlinked state.
- `SongSheet` y barra de controles de ejecución.

## Evaluación

El inventario compartido es pequeño (8 implementaciones/entradas UI más `SongRow`) frente a 14 pantallas. Esto explica la coherencia parcial pero también la duplicación. No conviene extraer todo de inmediato: Product Design debe primero fijar variantes, estados y contratos. Prioridad sugerida: inputs + estados + headers + chips; después cards de dominio.

