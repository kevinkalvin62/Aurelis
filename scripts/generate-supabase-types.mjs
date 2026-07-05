import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const executable =
  process.platform === "win32"
    ? resolve("node_modules", "@supabase", `cli-windows-${process.arch}`, "bin", "supabase.exe")
    : resolve("node_modules", ".bin", "supabase");
const result = spawnSync(
  executable,
  ["--workdir", "infra", "gen", "types", "typescript", "--local", "--schema", "public"],
  { encoding: "utf8" },
);

if (result.stderr) process.stderr.write(result.stderr);
if (result.status !== 0) process.exit(result.status ?? 1);

writeFileSync(
  resolve("apps", "mobile", "src", "types", "database.generated.ts"),
  `${result.stdout.trimEnd()}\n`,
  "utf8",
);
