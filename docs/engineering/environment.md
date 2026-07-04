# Variables de entorno

## Cliente Expo

| Variable                        |    Obligatoria | Sensibilidad | Uso                                    |
| ------------------------------- | -------------: | ------------ | -------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | sí para cuenta | pública      | URL de API/Auth                        |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | sí para cuenta | pública      | publishable/anon key protegida por RLS |

El prefijo `EXPO_PUBLIC_` incorpora el valor en el bundle. No ofrece secreto.
Nunca debe utilizarse para `service_role`, tokens personales, contraseñas de DB
o claves `sb_secret_*`.

## Desarrollo local

1. Copiar `.env.example` a `.env.local`.
2. Ejecutar `npm run backend:start`.
3. Tomar `Project URL` y `Publishable` de `npm run backend:status`.
4. Completar `.env.local` y reiniciar Metro.

`.env`, `.env.*` y sus variantes locales están ignorados; `.env.example` es la
única excepción versionada y contiene placeholders.

## EAS

Los perfiles `preview` y `production` declaran explícitamente su environment y
usan el mismo proyecto Supabase existente. Los valores son públicos y se
conservan en `eas.json` hasta que una migración al almacén de variables EAS pueda
verificarse sin romper builds. Las credenciales de firma Android permanecen en
EAS y no forman parte de estas variables.
