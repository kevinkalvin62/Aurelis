import { readFileSync } from "node:fs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const app = readJson("app.json").expo;
const eas = readJson("eas.json");
const failures = [];

if (!app?.android?.package) failures.push("app.json requires expo.android.package");
if (!app?.ios?.bundleIdentifier) {
  failures.push("app.json requires expo.ios.bundleIdentifier");
}
if (!app?.extra?.eas?.projectId) failures.push("app.json requires an EAS projectId");

for (const profileName of ["preview", "production"]) {
  const profile = eas?.build?.[profileName];
  if (!profile) {
    failures.push(`eas.json requires build.${profileName}`);
    continue;
  }
  for (const variable of ["EXPO_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_ANON_KEY"]) {
    if (!profile.env?.[variable]) {
      failures.push(`eas.json build.${profileName} requires ${variable}`);
    }
  }
}

const serializedEas = JSON.stringify(eas);
for (const forbidden of ["service_role", "sb_secret_", "SUPABASE_DB_PASSWORD"]) {
  if (serializedEas.includes(forbidden)) {
    failures.push(`eas.json contains forbidden server credential marker: ${forbidden}`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Project configuration is valid.");
