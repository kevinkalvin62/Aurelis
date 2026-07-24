# Android APK — preparación y generación

## Estado

Aurelis está configurado para generar un APK de preview instalable directamente
en teléfonos y emuladores Android. Este perfil usa el proyecto EAS existente, la
firma administrada por EAS y las variables públicas de Supabase necesarias para
cuenta y sincronización.

El perfil `production` permanece separado y conserva el formato AAB recomendado
para Google Play.

## Comprobar la configuración

Desde la raíz:

```bash
npm run apk:check
npm run quality
npm run doctor
```

`apk:check` valida identificador Android, proyecto EAS, formato APK, distribución
interna y ausencia de claves privadas de Supabase.

## Generar el instalador

1. Iniciar sesión en Expo con la cuenta propietaria del proyecto:

   ```bash
   npx eas-cli@20.5.0 login
   ```

2. Desde la raíz ejecutar:

   ```bash
   npm run apk:build
   ```

3. En el primer build, permitir que EAS cree o reutilice las credenciales de
   firma Android remotas.
4. Descargar el archivo `.apk` desde el enlace del build.

Este comando usa `apps/mobile/eas.json` → `build.preview`. No publica en Google
Play, no modifica Supabase y no despliega producción.

## Instalar

- Abrir el enlace del build desde el teléfono y autorizar la instalación desde
  esa fuente; o
- con Android Debug Bridge:

  ```bash
  adb install ruta/al/aurelis.apk
  ```

## Variables de Supabase

`EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` forman parte del
cliente y deben considerarse públicas. La seguridad depende de RLS y RPC. Nunca
se debe agregar `service_role`, `sb_secret_*`, contraseña de base de datos o un
token personal al APK.

## Referencias oficiales

- Expo SDK 56: https://docs.expo.dev/versions/v56.0.0/
- APK con EAS Build: https://docs.expo.dev/build-reference/apk/
- Configuración de `eas.json`: https://docs.expo.dev/build/eas-json/
- Variables de entorno EAS: https://docs.expo.dev/eas/environment-variables/
