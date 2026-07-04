# Aurelis

Plataforma móvil colaborativa para organizar, compartir y ejecutar repertorio musical. Esta base implementa el primer corte vertical del MVP con Expo SDK 56, Expo Router, TypeScript estricto, Supabase y un motor musical puro.

## Ejecutar

```bash
npm ci
copy .env.example .env.local
npm run start
```

SDK 56 está orientado a development builds. Para validar rápidamente en web usa `npm run web`.

Para trabajar contra un backend local reproducible:

```bash
npm run backend:start
npm run backend:reset
npm run backend:types
```

Completa `.env.local` con la URL y publishable key mostradas por
`npm run backend:status`. Consulta `docs/engineering/environment.md` antes de
configurar cualquier entorno compartido.

## Calidad

```bash
npm run typecheck
npm test
```

## Arquitectura

- `src/app`: navegación y composición de pantallas.
- `src/features/music-engine`: transposición y parser puros, sin dependencias de React.
- `src/components`: sistema visual compartido.
- `src/lib`: clientes de infraestructura.
- `src/store`: estado efímero de ejecución musical.
- `src/types/database.generated.ts`: contrato generado de PostgreSQL.
- `supabase/migrations`: esquema PostgreSQL reproducible y políticas RLS.

La app comienza sin datos simulados. Los invitados trabajan únicamente con almacenamiento local; los usuarios autenticados consultan y sincronizan con Supabase. El backend local se recrea mediante `npm run backend:reset`; producción no debe recibir migraciones hasta aprobar el ADR de baseline remoto.

## Datos y acceso

- La primera pantalla siempre ofrece login, registro y acceso como invitado.
- Invitado: canciones, ediciones y setlists persisten localmente con AsyncStorage.
- Cuenta: el guardado sigue siendo local-first y después sincroniza con Supabase; si la red o RLS fallan, el contenido queda pendiente sin perderse.
- Las canciones creadas como invitado se intentan sincronizar al iniciar sesión.
