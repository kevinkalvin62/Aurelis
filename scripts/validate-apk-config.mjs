import { readFile } from "node:fs/promises";

const appConfig = JSON.parse(await readFile(new URL("../apps/mobile/app.json", import.meta.url)));
const easConfig = JSON.parse(await readFile(new URL("../apps/mobile/eas.json", import.meta.url)));

const android = appConfig.expo?.android;
const projectId = appConfig.expo?.extra?.eas?.projectId;
const preview = easConfig.build?.preview;
const supabaseUrl = preview?.env?.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = preview?.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const requirements = [
  [appConfig.expo?.name === "Aurelis", "expo.name must be Aurelis"],
  [Boolean(android?.package), "android.package is required"],
  [
    /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(android?.package ?? ""),
    "android.package is invalid",
  ],
  [Boolean(projectId), "EAS projectId is required"],
  [preview?.distribution === "internal", "preview must use internal distribution"],
  [preview?.android?.buildType === "apk", "preview android.buildType must be apk"],
  [preview?.environment === "preview", "preview must select the EAS preview environment"],
  [
    supabaseUrl?.startsWith("https://") && supabaseUrl.endsWith(".supabase.co"),
    "Supabase URL is invalid",
  ],
  [Boolean(supabaseKey) && !supabaseKey.includes("your-"), "Supabase publishable key is missing"],
  [
    !/(service_role|sb_secret_)/i.test(supabaseKey ?? ""),
    "A private Supabase key must never enter the APK",
  ],
];

const errors = requirements.filter(([valid]) => !valid).map(([, message]) => message);
if (errors.length) {
  throw new Error(`APK configuration is invalid:\n- ${errors.join("\n- ")}`);
}

console.log(`APK configuration is ready for ${android.package} (${projectId}).`);
