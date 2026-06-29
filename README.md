# Aurelis

Plataforma móvil colaborativa para organizar, compartir y ejecutar repertorio musical. Esta base implementa el primer corte vertical del MVP con Expo SDK 56, Expo Router, TypeScript estricto, Supabase y un motor musical puro.

## Ejecutar

```bash
copy .env.example .env
npm install
npm run start
```

SDK 56 está orientado a development builds. Para validar rápidamente en web usa `npm run web`.

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
- `supabase/migrations`: esquema PostgreSQL y políticas RLS.

La app comienza sin datos simulados. Los invitados trabajan únicamente con almacenamiento local; los usuarios autenticados consultan y sincronizan con Supabase. Antes de usar las funciones de iglesia se debe aplicar la migración y generar tipos con Supabase CLI.

## Datos y acceso

- La primera pantalla siempre ofrece login, registro y acceso como invitado.
- Invitado: canciones, ediciones y setlists persisten localmente con AsyncStorage.
- Cuenta: el guardado sigue siendo local-first y después sincroniza con Supabase; si la red o RLS fallan, el contenido queda pendiente sin perderse.
- Las canciones creadas como invitado se intentan sincronizar al iniciar sesión.
