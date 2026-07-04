import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: [
        "src/features/music-engine/*.ts",
        "src/features/organizations/instrument-material.ts",
        "src/features/organizations/permissions.ts",
        "src/features/setlists/next-setlist.ts",
        "src/features/setlists/parser.ts",
        "src/features/setlists/setlist-key.ts",
        "src/features/setlists/setlist-source.ts",
        "src/features/songs/song-mapper.ts",
        "src/lib/dates.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 85,
        lines: 85,
      },
    },
  },
});
